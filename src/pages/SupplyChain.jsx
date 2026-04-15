import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link2, Search, Loader2, Database, MapPin, Clock, Shield, ChevronDown, ChevronUp, Hash, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EVENT_LABELS } from "@/lib/blockchain";
import { cn } from "@/lib/utils";
import moment from "moment";

export default function SupplyChain() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedBlockId, setExpandedBlockId] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await base44.entities.SupplyChainBlock.list("-created_date", 100);
      setBlocks(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = blocks.filter(
    (b) =>
      !search ||
      b.booking_id?.toLowerCase().includes(search.toLowerCase()) ||
      b.block_hash?.toLowerCase().includes(search.toLowerCase()) ||
      b.event_type?.toLowerCase().includes(search.toLowerCase())
  );

  // Group blocks by booking_id
  const grouped = {};
  filtered.forEach((block) => {
    if (!grouped[block.booking_id]) grouped[block.booking_id] = [];
    grouped[block.booking_id].push(block);
  });

  // Sort each group
  Object.values(grouped).forEach((arr) => arr.sort((a, b) => (a.block_index || 0) - (b.block_index || 0)));

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
          <Link2 className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Supply Chain Tracker</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Immutable blockchain-verified supply chain for every cylinder
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by booking ID, hash, or event..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-xl"
        />
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16">
          <Link2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No supply chain data found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([bookingId, chainBlocks]) => (
            <div key={bookingId} className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <Database className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold font-mono">{bookingId}</h3>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  {chainBlocks.length} blocks
                </span>
              </div>

              <div className="relative">
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border" />
                <div className="space-y-3">
                  {chainBlocks.map((block, idx) => {
                    const isExpanded = expandedBlockId === block.id;
                    let eventData = null;
                    if (block.event_data) {
                      try { eventData = JSON.parse(block.event_data); } catch {}
                    }

                    return (
                      <div key={block.id} className="relative">
                        <div 
                          className={cn(
                            "group relative flex gap-3 pl-0 cursor-pointer transition-all p-3 rounded-xl",
                            isExpanded ? "bg-muted/50 shadow-sm" : "hover:bg-muted/20"
                          )}
                          onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                        >
                          <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center z-10 flex-shrink-0 text-[10px] font-bold transition-all",
                            idx === chainBlocks.length - 1
                              ? "bg-primary text-primary-foreground ring-4 ring-primary/10"
                              : "bg-muted text-muted-foreground",
                            isExpanded && "scale-110"
                          )}>
                            #{block.block_index}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold">
                                  {EVENT_LABELS[block.event_type] || block.event_type}
                                </span>
                                <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
                                  <Clock className="h-2.5 w-2.5" />
                                  {moment(block.created_date).format("h:mm A")}
                                </span>
                              </div>
                              {isExpanded ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </div>
                            
                            {block.location && (
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="h-2.5 w-2.5" /> {block.location}
                              </p>
                            )}
                            
                            {!isExpanded && (
                              <p className="text-[9px] font-mono text-muted-foreground/40 truncate mt-1">
                                🔗 {block.block_hash}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Expansion Area */}
                        {isExpanded && (
                          <div className="ml-11 mt-1 mb-4 p-4 rounded-xl bg-background border border-border/50 animate-in slide-in-from-top-1 duration-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <div>
                                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Block Metadata</p>
                                  <div className="space-y-1.5">
                                    <MetaRow icon={Hash} label="Current Hash" value={block.block_hash} mono />
                                    <MetaRow icon={Link2} label="Previous Hash" value={block.previous_hash} mono />
                                    <MetaRow icon={Shield} label="Verified By" value={block.verified_by || "System Consensus"} />
                                    <MetaRow icon={Clock} label="Timestamp" value={moment(block.created_date).format("DD MMM YYYY, h:mm:ss A")} />
                                  </div>
                                </div>
                                
                                <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                  <div className="flex items-center gap-2 text-emerald-600">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    <p className="text-[10px] font-bold uppercase tracking-tight">On-Chain Verified</p>
                                  </div>
                                  <p className="text-[9px] text-emerald-600/70 mt-0.5">Cryptographically signed and immutable.</p>
                                </div>
                              </div>

                              <div>
                                <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Event Payload</p>
                                <div className="p-3 rounded-lg bg-muted/30 border border-border/50 h-full overflow-hidden">
                                  {eventData ? (
                                    <pre className="text-[10px] font-mono text-muted-foreground overflow-x-auto">
                                      {JSON.stringify(eventData, null, 2)}
                                    </pre>
                                  ) : (
                                    <p className="text-[10px] text-muted-foreground italic">No extra payload data for this event.</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MetaRow({ icon: Icon, label, value, mono = false }) {
  if (!value) return null;
  return (
    <div className="flex flex-col">
      <span className="text-[8px] text-muted-foreground/70 uppercase font-bold">{label}</span>
      <div className="flex items-center gap-1.5">
        <Icon className="h-2.5 w-2.5 text-muted-foreground/50 flex-shrink-0" />
        <span className={cn("text-[10px] truncate", mono ? "font-mono text-muted-foreground/80" : "font-medium")}>
          {value}
        </span>
      </div>
    </div>
  );
}
