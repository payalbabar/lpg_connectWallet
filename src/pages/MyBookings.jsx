import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ClipboardList, Loader2 } from "lucide-react";
import { STATUS_COLORS, CYLINDER_LABELS } from "@/lib/blockchain";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import moment from "moment";
import BookingDetail from "../components/BookingDetail";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await base44.entities.Booking.list("-created_date", 50);
      setBookings(data);
      
      // Update the selected booking if we are currently viewing one
      if (selected) {
        const updated = data.find(b => b.id === selected.id);
        if (updated) setSelected(updated);
      }
      
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [selected?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (selected) {
    return <BookingDetail booking={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">My Bookings</h1>
          </div>
          <p className="text-sm text-muted-foreground">{bookings.length} bookings found</p>
        </div>
        <Link to="/book">
          <Button size="sm" className="rounded-xl">New Booking</Button>
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No bookings yet</p>
          <Link to="/book">
            <Button className="mt-4 rounded-xl" size="sm">Book Your First Cylinder</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-card rounded-2xl border border-border p-4 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelected(booking)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-bold font-mono">{booking.booking_id}</span>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase", STATUS_COLORS[booking.status])}>
                      {booking.status?.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {CYLINDER_LABELS[booking.cylinder_type]} × {booking.quantity}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60">
                    {booking.customer_address} • {moment(booking.created_date).format("DD MMM YYYY, h:mm A")}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold">₹{(booking.final_amount || booking.total_amount || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">{booking.payment_method}</p>
                </div>
              </div>
              {booking.block_hash && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <p className="text-[10px] font-mono text-muted-foreground/40 truncate">
                    🔗 {booking.block_hash}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
