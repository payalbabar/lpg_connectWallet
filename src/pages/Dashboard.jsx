import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart, Wallet, Database, TrendingUp, Flame,
  X, ArrowRight, Clock, Shield, CheckCircle2, Package, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS, CYLINDER_LABELS, EVENT_LABELS } from "@/lib/blockchain";
import { Button } from "@/components/ui/button";
import StatCard from "../components/dashboard/StatCard";
import RecentBlocks from "../components/dashboard/RecentBlocks";
import RecentBookings from "../components/dashboard/RecentBookings";
import moment from "moment";

export default function Dashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [subsidies, setSubsidies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState(null); // "bookings" | "blocks" | "subsidies" | "active"

  useEffect(() => {
    async function load() {
      const [b, bl, s] = await Promise.all([
        base44.entities.Booking.list("-created_date", 10),
        base44.entities.SupplyChainBlock.list("-created_date", 10),
        base44.entities.Subsidy.list("-created_date", 10),
      ]);
      setBookings(b);
      setBlocks(bl);
      setSubsidies(s);
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalSubsidy = subsidies
    .filter((s) => s.status === "credited")
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  const activeBookings = bookings.filter((b) => !["delivered", "cancelled"].includes(b.status));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Flame className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Blockchain-powered LPG cylinder management overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ShoppingCart}
          label="Total Bookings"
          value={bookings.length}
          subtitle={`${activeBookings.length} active`}
          color="primary"
          onClick={() => setActivePanel(activePanel === "bookings" ? null : "bookings")}
        />
        <StatCard
          icon={Database}
          label="Chain Blocks"
          value={blocks.length}
          subtitle="Immutable records"
          color="secondary"
          onClick={() => setActivePanel(activePanel === "blocks" ? null : "blocks")}
        />
        <StatCard
          icon={Wallet}
          label="Subsidies Credited"
          value={`₹${totalSubsidy.toLocaleString()}`}
          subtitle={`${subsidies.filter((s) => s.status === "credited").length} transactions`}
          color="accent"
          onClick={() => setActivePanel(activePanel === "subsidies" ? null : "subsidies")}
        />
        <StatCard
          icon={TrendingUp}
          label="Active Orders"
          value={activeBookings.length}
          subtitle="In pipeline"
          color="primary"
          onClick={() => setActivePanel(activePanel === "active" ? null : "active")}
        />
      </div>

      {/* Drilldown Panel */}
      {activePanel && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden animate-in slide-in-from-top-2 duration-300">
          {/* Panel Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center", {
                "bg-primary/10 text-primary": activePanel === "bookings" || activePanel === "active",
                "bg-secondary/10 text-secondary": activePanel === "blocks",
                "bg-accent/10 text-accent": activePanel === "subsidies",
              })}>
                {activePanel === "bookings" && <ShoppingCart className="h-4 w-4" />}
                {activePanel === "blocks" && <Database className="h-4 w-4" />}
                {activePanel === "subsidies" && <Wallet className="h-4 w-4" />}
                {activePanel === "active" && <TrendingUp className="h-4 w-4" />}
              </div>
              <div>
                <h3 className="text-sm font-bold">
                  {activePanel === "bookings" && "All Bookings"}
                  {activePanel === "blocks" && "Blockchain Blocks"}
                  {activePanel === "subsidies" && "Subsidy Transactions"}
                  {activePanel === "active" && "Active Orders"}
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  {activePanel === "bookings" && `${bookings.length} total bookings recorded on chain`}
                  {activePanel === "blocks" && `${blocks.length} immutable blocks on the ledger`}
                  {activePanel === "subsidies" && `₹${totalSubsidy.toLocaleString()} credited across ${subsidies.filter(s => s.status === "credited").length} transactions`}
                  {activePanel === "active" && `${activeBookings.length} orders currently in pipeline`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs rounded-lg"
                onClick={() => {
                  if (activePanel === "bookings" || activePanel === "active") navigate("/bookings");
                  else if (activePanel === "blocks") navigate("/ledger");
                  else if (activePanel === "subsidies") navigate("/subsidies");
                }}
              >
                View Full Page <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setActivePanel(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="p-6 max-h-[400px] overflow-y-auto">
            {/* BOOKINGS */}
            {activePanel === "bookings" && (
              bookings.length === 0 ? (
                <EmptyState icon={ShoppingCart} text="No bookings yet" />
              ) : (
                <div className="space-y-2">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer"
                      onClick={() => navigate("/bookings")}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Package className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold font-mono">{b.booking_id}</span>
                            <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase", STATUS_COLORS[b.status])}>
                              {b.status?.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {CYLINDER_LABELS[b.cylinder_type] || b.cylinder_type} × {b.quantity} • {b.customer_name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold">₹{(b.final_amount || b.total_amount || 0).toLocaleString()}</p>
                        <p className="text-[9px] text-muted-foreground">{moment(b.created_date).fromNow()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* BLOCKS */}
            {activePanel === "blocks" && (
              blocks.length === 0 ? (
                <EmptyState icon={Database} text="No blocks recorded" />
              ) : (
                <div className="space-y-2">
                  {blocks.map((block) => (
                    <div
                      key={block.id}
                      className="flex items-center justify-between gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer"
                      onClick={() => navigate("/ledger")}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-secondary">#{block.block_index}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold">{EVENT_LABELS[block.event_type] || block.event_type}</p>
                          <p className="text-[9px] font-mono text-muted-foreground/50 truncate">
                            {block.block_hash}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                          <Shield className="h-2.5 w-2.5" />
                          {block.verified_by || "System"}
                        </div>
                        <p className="text-[9px] text-muted-foreground/50">{moment(block.created_date).fromNow()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* SUBSIDIES */}
            {activePanel === "subsidies" && (
              subsidies.length === 0 ? (
                <EmptyState icon={Wallet} text="No subsidy transactions" />
              ) : (
                <div className="space-y-2">
                  {subsidies.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer"
                      onClick={() => navigate("/subsidies")}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0",
                          s.status === "credited" ? "bg-emerald-500/10" : "bg-amber-500/10"
                        )}>
                          {s.status === "credited"
                            ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            : <Clock className="h-4 w-4 text-amber-500" />
                          }
                        </div>
                        <div>
                          <p className="text-xs font-semibold">₹{(s.amount || 0).toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {s.scheme || "Ujjwala Yojana"} • {s.booking_id || "—"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          "text-[9px] px-2 py-0.5 rounded-full font-semibold",
                          s.status === "credited" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        )}>
                          {s.status || "pending"}
                        </span>
                        <p className="text-[9px] text-muted-foreground/50 mt-1">{moment(s.created_date).fromNow()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* ACTIVE ORDERS */}
            {activePanel === "active" && (
              activeBookings.length === 0 ? (
                <EmptyState icon={TrendingUp} text="No active orders right now" />
              ) : (
                <div className="space-y-2">
                  {activeBookings.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer"
                      onClick={() => navigate("/bookings")}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Loader2 className="h-4 w-4 text-primary animate-spin" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold font-mono">{b.booking_id}</span>
                            <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase", STATUS_COLORS[b.status])}>
                              {b.status?.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {CYLINDER_LABELS[b.cylinder_type] || b.cylinder_type} • {b.customer_name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold">₹{(b.final_amount || b.total_amount || 0).toLocaleString()}</p>
                        <p className="text-[9px] text-muted-foreground">{moment(b.created_date).fromNow()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Two column layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        <RecentBookings bookings={bookings} />
        <RecentBlocks blocks={blocks} />
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="text-center py-12">
      <Icon className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
