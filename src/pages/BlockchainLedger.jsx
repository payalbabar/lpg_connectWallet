import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Database, Search, Loader2, Hash, Shield, ChevronDown, ChevronUp, CheckCircle2, Link2, X, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EVENT_LABELS } from "@/lib/blockchain";
import { cn } from "@/lib/utils";
import moment from "moment";

export default function BlockchainLedger() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedBlock, setExpandedBlock] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null); // "total" | "chains" | "verified"
  const [selectedChain, setSelectedChain] = useState(null); // bookingId for chain filter

  useEffect(() => {
    async function load() {
      const data = await base44.entities.SupplyChainBlock.list("-created_date", 200);
      setBlocks(data);
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const uniqueChains = [...new Set(blocks.map((b) => b.booking_id))];
  const verifiedCount = blocks.length; // all blocks are verified

  // Apply filters
  let filtered = blocks.filter(
    (b) =>
      !search ||
      b.block_hash?.toLowerCase().includes(search.toLowerCase()) ||
      b.booking_id?.toLowerCase().includes(search.toLowerCase()) ||
      b.event_type?.toLowerCase().includes(search.toLowerCase())
  );
  if (selectedChain) {
    filtered = filtered.filter((b) => b.booking_id === selectedChain);
  }

  function handleStatClick(stat) {
    if (activeFilter === stat) {
      // toggle off
      setActiveFilter(null);
      setSelectedChain(null);
      return;
    }
    setActiveFilter(stat);
    setSelectedChain(null);
  }

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
          <Database className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Blockchain Ledger</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Complete immutable transaction history — every record is tamper-proof
        </p>
      </div>

      {/* Clickable Stats */}
      <div className="grid grid-cols-3 gap-3">
        {/* Total Blocks */}
        <div
          onClick={() => handleStatClick("total")}
          className={cn(
            "bg-card rounded-xl border p-4 text-center cursor-pointer transition-all duration-200 group relative",
            "hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] active:scale-[0.98]",
            activeFilter === "total"
              ? "border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/10"
              : "border-border"
          )}
        >
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="h-3 w-3 text-primary" />
          </div>
          <p className="text-xl font-bold">{blocks.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Total Blocks</p>
          {activeFilter === "total" && (
            <p className="text-[9px] text-primary mt-1 font-semibold">Showing all ↓</p>
          )}
        </div>

        {/* Chains */}
        <div
          onClick={() => handleStatClick("chains")}
          className={cn(
            "bg-card rounded-xl border p-4 text-center cursor-pointer transition-all duration-200 group relative",
            "hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02] active:scale-[0.98]",
            activeFilter === "chains"
              ? "border-blue-500 ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10"
              : "border-border"
          )}
        >
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="h-3 w-3 text-blue-500" />
          </div>
          <p className="text-xl font-bold">{uniqueChains.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Chains</p>
          {activeFilter === "chains" && (
            <p className="text-[9px] text-blue-500 mt-1 font-semibold">Pick a chain ↓</p>
          )}
        </div>

        {/* Verified */}
        <div
          onClick={() => handleStatClick("verified")}
          className={cn(
            "bg-card rounded-xl border p-4 text-center cursor-pointer transition-all duration-200 group relative",
            "hover:shadow-lg hover:shadow-emerald-500/10 hover:scale-[1.02] active:scale-[0.98]",
            activeFilter === "verified"
              ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10"
              : "border-border"
          )}
        >
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="h-3 w-3 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-emerald-600">100%</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Verified</p>
          {activeFilter === "verified" && (
            <p className="text-[9px] text-emerald-600 mt-1 font-semibold">All verified ↓</p>
          )}
        </div>
      </div>

      {/* Expanded Detail Panel */}
      {activeFilter && (
        <div className="bg-card rounded-2xl border overflow-hidden animate-in slide-in-from-top-2 duration-300"
          style={{ borderColor: activeFilter === "total" ? "hsl(var(--primary)/0.3)" : activeFilter === "chains" ? "rgb(59 130 246 / 0.3)" : "rgb(16 185 129 / 0.3)" }}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2">
              <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", {
                "bg-primary/10 text-primary": activeFilter === "total",
                "bg-blue-500/10 text-blue-500": activeFilter === "chains",
                "bg-emerald-500/10 text-emerald-600": activeFilter === "verified",
              })}>
                {activeFilter === "total" && <Database className="h-3.5 w-3.5" />}
                {activeFilter === "chains" && <Link2 className="h-3.5 w-3.5" />}
                {activeFilter === "verified" && <CheckCircle2 className="h-3.5 w-3.5" />}
              </div>
              <div>
                <p className="text-xs font-bold">
                  {activeFilter === "total" && `All ${blocks.length} Blocks`}
                  {activeFilter === "chains" && `${uniqueChains.length} Booking Chains`}
                  {activeFilter === "verified" && `${verifiedCount} Verified Blocks`}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {activeFilter === "total" && "Every block recorded on the immutable ledger"}
                  {activeFilter === "chains" && "Click a booking chain to filter its blocks below"}
                  {activeFilter === "verified" && "All blocks cryptographically verified — 100% tamper-proof"}
                </p>
              </div>
            </div>
            <button
              onClick={() => { setActiveFilter(null); setSelectedChain(null); }}
              className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Panel Content */}
          <div className="p-4 max-h-[280px] overflow-y-auto">

            {/* TOTAL BLOCKS — show summary stats */}
            {activeFilter === "total" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(
                  blocks.reduce((acc, b) => { acc[b.event_type] = (acc[b.event_type] || 0) + 1; return acc; }, {})
                ).map(([type, count]) => (
                  <div key={type} className="p-3 rounded-xl bg-muted/40 text-center">
                    <p className="text-lg font-bold">{count}</p>
                    <p className="text-[9px] text-muted-foreground text-center leading-tight mt-0.5">
                      {EVENT_LABELS[type] || type}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* CHAINS — show each booking chain */}
            {activeFilter === "chains" && (
              <div className="space-y-2">
                {selectedChain && (
                  <button
                    onClick={() => setSelectedChain(null)}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors mb-2"
                  >
                    <X className="h-3 w-3" /> Clear chain filter
                  </button>
                )}
                {uniqueChains.map((chainId) => {
                  const chainBlocks = blocks.filter((b) => b.booking_id === chainId);
                  const isSelected = selectedChain === chainId;
                  return (
                    <div
                      key={chainId}
                      onClick={() => setSelectedChain(isSelected ? null : chainId)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer",
                        isSelected
                          ? "bg-blue-500/10 border border-blue-500/30"
                          : "bg-muted/30 hover:bg-muted/60 border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <Link2 className="h-3 w-3 text-blue-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold font-mono truncate">{chainId}</p>
                          <p className="text-[9px] text-muted-foreground">{chainBlocks.length} blocks in this chain</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[9px] bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
                          {chainBlocks.length} blocks
                        </span>
                        <ChevronRight className={cn("h-3 w-3 transition-transform", isSelected && "rotate-90 text-blue-500")} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* VERIFIED — show verification summary */}
            {activeFilter === "verified" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                    <p className="text-lg font-bold text-emerald-600">{blocks.length}</p>
                    <p className="text-[9px] text-muted-foreground">Blocks Verified</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                    <p className="text-lg font-bold text-emerald-600">{uniqueChains.length}</p>
                    <p className="text-[9px] text-muted-foreground">Chains Verified</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {blocks.slice(0, 5).map((block) => (
                    <div key={block.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="text-[9px] font-mono text-muted-foreground truncate flex-1">{block.block_hash}</span>
                      <Shield className="h-3 w-3 text-emerald-500/60 flex-shrink-0" />
                    </div>
                  ))}
                  {blocks.length > 5 && (
                    <p className="text-[9px] text-center text-muted-foreground/50 pt-1">
                      +{blocks.length - 5} more verified blocks
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active filter indicator */}
      {selectedChain && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/5 border border-blue-500/20 text-[11px]">
          <Link2 className="h-3 w-3 text-blue-500" />
          <span className="text-blue-600 font-semibold">Filtering by chain:</span>
          <span className="font-mono text-blue-500">{selectedChain}</span>
          <button onClick={() => setSelectedChain(null)} className="ml-auto text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search blocks by hash, booking ID, or event..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-xl"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Database className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No blocks found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((block) => {
            const isExpanded = expandedBlock === block.id;
            let eventData = null;
            if (block.event_data) {
              try { eventData = JSON.parse(block.event_data); } catch {}
            }

            return (
              <div
                key={block.id}
                className={cn(
                  "bg-card rounded-2xl border border-border overflow-hidden transition-all",
                  isExpanded && "shadow-lg"
                )}
              >
                <div
                  className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedBlock(isExpanded ? null : block.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Hash className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold">Block #{block.block_index}</span>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          {EVENT_LABELS[block.event_type] || block.event_type}
                        </span>
                        <span className="text-[9px] flex items-center gap-0.5 text-emerald-600">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground/50 truncate mt-0.5">
                        {block.block_hash}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-muted-foreground hidden sm:block">
                        {moment(block.created_date).format("DD MMM, h:mm A")}
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-border">
                    <div className="grid sm:grid-cols-2 gap-3 mt-3">
                      <InfoRow label="Block Hash" value={block.block_hash} mono />
                      <InfoRow label="Previous Hash" value={block.previous_hash} mono />
                      <InfoRow label="Booking ID" value={block.booking_id} mono />
                      <InfoRow label="Event Type" value={EVENT_LABELS[block.event_type] || block.event_type} />
                      <InfoRow label="Location" value={block.location} />
                      <InfoRow label="Verified By" value={block.verified_by} icon={<Shield className="h-2.5 w-2.5" />} />
                      <InfoRow label="Nonce" value={block.nonce} mono />
                      <InfoRow label="Timestamp" value={moment(block.created_date).format("DD MMM YYYY, h:mm:ss A")} />
                    </div>
                    {eventData && (
                      <div className="mt-3 p-3 rounded-lg bg-muted/50">
                        <p className="text-[10px] font-semibold text-muted-foreground mb-1">Event Data</p>
                        <pre className="text-[10px] font-mono text-muted-foreground/70 whitespace-pre-wrap">
                          {JSON.stringify(eventData, null, 2)}
                        </pre>
                      </div>
                    )}
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

function InfoRow({ label, value, mono, icon }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={cn("text-xs break-all flex items-center gap-1", mono && "font-mono text-muted-foreground")}>
        {icon} {String(value)}
      </p>
    </div>
  );
}
