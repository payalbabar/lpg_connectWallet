import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Database, MapPin, Clock, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_COLORS, EVENT_LABELS, generateBlockHash } from "@/lib/blockchain";
import { cn } from "@/lib/utils";
import moment from "moment";
import { toast } from "@/hooks/use-toast";

const STATUS_FLOW = ["pending", "confirmed", "dispatched", "in_transit", "delivered"];

export default function BookingDetail({ booking, onBack }) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    async function load() {
      const data = await base44.entities.SupplyChainBlock.filter(
        { booking_id: booking.booking_id },
        "created_date",
        50
      );
      setBlocks(data);
      setLoading(false);
    }
    load();
  }, [booking.booking_id]);

  async function handleStatusUpdate() {
    if (!newStatus) return;
    setUpdating(true);

    await base44.entities.Booking.update(booking.id, { status: newStatus });

    const maxIndex = blocks.reduce((max, b) => Math.max(max, b.block_index || 0), 0);
    const lastBlock = blocks.find(b => b.block_index === maxIndex) || blocks[0];
    const prevHash = lastBlock?.block_hash || "0x0000000000000000";
    const newHash = generateBlockHash(prevHash, { booking_id: booking.booking_id, event: newStatus });

    const eventMap = {
      confirmed: "cylinder_assigned",
      dispatched: "dispatched",
      in_transit: "in_transit",
      delivered: "delivered",
    };

    await base44.entities.SupplyChainBlock.create({
      block_index: maxIndex + 1,
      block_hash: newHash,
      previous_hash: prevHash,
      timestamp: new Date().toISOString(),
      booking_id: booking.booking_id,
      event_type: eventMap[newStatus] || newStatus,
      event_data: JSON.stringify({ status: newStatus, updated_at: new Date().toISOString() }),
      location: newStatus === "delivered" ? booking.customer_address : "Distribution Center",
      verified_by: "Admin Node",
      nonce: Math.floor(Math.random() * 100000),
    });

    const updatedBlocks = await base44.entities.SupplyChainBlock.filter(
      { booking_id: booking.booking_id },
      "created_date",
      50
    );
    setBlocks(updatedBlocks);
    setUpdating(false);
    setNewStatus("");
    toast({ title: "Status updated & recorded on blockchain" });
  }

  const currentIdx = STATUS_FLOW.indexOf(booking.status);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Button variant="ghost" size="sm" onClick={onBack} className="rounded-lg">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Bookings
      </Button>

      {/* Header */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg font-bold font-mono">{booking.booking_id}</h1>
              <span className={cn("text-xs px-2.5 py-0.5 rounded-full font-semibold", STATUS_COLORS[booking.status])}>
                {booking.status?.replace("_", " ")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{booking.customer_name} • {booking.customer_phone}</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">{booking.customer_address}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">₹{(booking.final_amount || 0).toLocaleString()}</p>
            {booking.subsidy_applied > 0 && (
              <p className="text-xs text-emerald-600">Subsidy: ₹{booking.subsidy_applied}</p>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 flex items-center gap-1">
          {STATUS_FLOW.map((status, i) => (
            <div key={status} className="flex-1 flex flex-col items-center">
              <div
                className={cn(
                  "h-2 w-full rounded-full transition-colors",
                  i <= currentIdx ? "bg-primary" : "bg-muted"
                )}
              />
              <span className={cn(
                "text-[9px] mt-1 capitalize",
                i <= currentIdx ? "text-primary font-semibold" : "text-muted-foreground/50"
              )}>
                {status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Update Status */}
      {booking.status !== "delivered" && booking.status !== "cancelled" && (
        <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger className="flex-1"><SelectValue placeholder="Update status..." /></SelectTrigger>
            <SelectContent>
              {STATUS_FLOW.filter((_, i) => i > currentIdx).map((s) => (
                <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleStatusUpdate} disabled={!newStatus || updating} className="rounded-xl" size="sm">
            {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update & Record"}
          </Button>
        </div>
      )}

      {/* Blockchain Trail */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Blockchain Supply Chain Trail</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : blocks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No blocks recorded yet</p>
        ) : (
          <div className="relative">
            <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-border" />
            <div className="space-y-4">
              {blocks.map((block, idx) => (
                <div key={block.id} className="relative flex gap-4 pl-0">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center z-10 flex-shrink-0",
                    idx === blocks.length - 1 ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    <span className="text-[10px] font-bold">#{block.block_index}</span>
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold">
                        {EVENT_LABELS[block.event_type] || block.event_type}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {moment(block.created_date).format("DD MMM, h:mm A")}
                      </span>
                    </div>
                    {block.location && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-2.5 w-2.5" /> {block.location}
                      </p>
                    )}
                    <div className="mt-1.5 p-2 rounded-lg bg-muted/50">
                      <p className="text-[9px] font-mono text-muted-foreground/60 truncate">
                        Hash: {block.block_hash}
                      </p>
                      <p className="text-[9px] font-mono text-muted-foreground/40 truncate">
                        Prev: {block.previous_hash}
                      </p>
                      {block.verified_by && (
                        <p className="text-[9px] text-muted-foreground/50 mt-0.5 flex items-center gap-1">
                          <Shield className="h-2 w-2" /> Verified by {block.verified_by}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
