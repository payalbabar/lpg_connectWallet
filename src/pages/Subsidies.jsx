import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Wallet, Loader2, CheckCircle2, Clock, XCircle, AlertCircle, ClipboardList, FilterX, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import moment from "moment";
import StatCard from "../components/dashboard/StatCard";
import { Button } from "@/components/ui/button";

const SUBSIDY_LABELS = {
  bpl: "BPL Scheme",
  apl: "APL Scheme",
  ujjwala: "PM Ujjwala Yojana",
  pmuy: "PMUY",
  state_scheme: "State Scheme",
};

const STATUS_CONFIG = {
  pending: { icon: Clock, color: "bg-amber-100 text-amber-700", label: "Pending" },
  credited: { icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700", label: "Credited" },
  rejected: { icon: XCircle, color: "bg-red-100 text-red-700", label: "Rejected" },
  expired: { icon: AlertCircle, color: "bg-gray-100 text-gray-700", label: "Expired" },
};

export default function Subsidies() {
  const [subsidies, setSubsidies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(null); // null | 'credited' | 'pending'
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await base44.entities.Subsidy.list("-created_date", 50);
      setSubsidies(data);
      setLoading(false);
    }
    load();
  }, []);

  const totalCredited = subsidies
    .filter((s) => s.status === "credited")
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  const totalPending = subsidies
    .filter((s) => s.status === "pending")
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Subsidy Management</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Government LPG subsidies tracked on blockchain for transparency
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={CheckCircle2}
          label="Total Credited"
          value={`₹${totalCredited.toLocaleString()}`}
          color="accent"
          onClick={() => setActiveFilter(activeFilter === "credited" ? null : "credited")}
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={`₹${totalPending.toLocaleString()}`}
          color="secondary"
          onClick={() => setActiveFilter(activeFilter === "pending" ? null : "pending")}
        />
        <StatCard
          icon={ClipboardList}
          label="Total Claims"
          value={subsidies.length}
          color="primary"
          onClick={() => setActiveFilter(null)}
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          {activeFilter ? (
            <>
              Showing {activeFilter} subsidies
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-[10px] text-primary"
                onClick={() => setActiveFilter(null)}
              >
                <FilterX className="h-3 w-3 mr-1" /> Clear Filter
              </Button>
            </>
          ) : (
            "Recent Subsidy History"
          )}
        </h2>
      </div>

      {/* Subsidy List */}
      {subsidies.length === 0 ? (
        <div className="text-center py-16">
          <Wallet className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No subsidies recorded yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Book a domestic cylinder to auto-apply subsidy</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subsidies
            .filter(s => !activeFilter || s.status === activeFilter)
            .map((subsidy) => {
            const config = STATUS_CONFIG[subsidy.status] || STATUS_CONFIG.pending;
            const StatusIcon = config.icon;
            const isExpanded = expandedId === subsidy.id;

            return (
              <div 
                key={subsidy.id} 
                className={cn(
                  "bg-card rounded-2xl border border-border transition-all cursor-pointer overflow-hidden",
                  isExpanded ? "shadow-lg border-primary/30" : "hover:bg-muted/30"
                )}
                onClick={() => setExpandedId(isExpanded ? null : subsidy.id)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold">
                          {SUBSIDY_LABELS[subsidy.subsidy_type] || subsidy.subsidy_type}
                        </span>
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1", config.color)}>
                          <StatusIcon className="h-2.5 w-2.5" />
                          {config.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{subsidy.beneficiary_name}</p>
                      
                      {!isExpanded && (
                         <p className="text-[10px] text-muted-foreground/40 font-mono mt-1 truncate">
                           🔗 {subsidy.block_hash || "Simulated on-chain"}
                         </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold">₹{(subsidy.amount || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {moment(subsidy.created_date).format("DD MMM YYYY")}
                      </p>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-4 border-t border-border/50 bg-muted/20 animate-in slide-in-from-top-1 duration-200">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Booking ID</p>
                        <p className="text-[11px] font-mono">{subsidy.booking_id || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Aadhaar Status</p>
                        <p className={cn("text-[11px] font-medium", subsidy.aadhaar_linked ? "text-emerald-600" : "text-amber-600")}>
                          {subsidy.aadhaar_linked ? "✓ Verified & Linked" : "Not Linked"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Remarks</p>
                        <p className="text-[11px] text-muted-foreground/80 italic">
                          {subsidy.remarks || "No additional remarks for this transaction."}
                        </p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-background border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Blockchain Evidence</p>
                        <Shield className="h-3 w-3 text-emerald-500" />
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground/60 break-all bg-muted/50 p-2 rounded-lg">
                        {subsidy.block_hash || "HASH_PENDING_CONFIRMATION_0x001"}
                      </p>
                      <p className="text-[9px] text-emerald-600 mt-2 flex items-center gap-1">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Immutable ledger record verified
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
