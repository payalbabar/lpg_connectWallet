import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { STATUS_COLORS, CYLINDER_LABELS } from "@/lib/blockchain";
import { cn } from "@/lib/utils";
import moment from "moment";

export default function RecentBookings({ bookings }) {
  if (!bookings || bookings.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-sm font-semibold mb-4">Recent Bookings</h3>
        <p className="text-sm text-muted-foreground text-center py-8">No bookings yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Recent Bookings</h3>
        <Link to="/bookings" className="text-xs text-primary hover:underline flex items-center gap-1">
          View All <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {bookings.slice(0, 5).map((booking) => (
          <div key={booking.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-xs font-semibold truncate">{booking.booking_id}</p>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[booking.status])}>
                  {booking.status}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {CYLINDER_LABELS[booking.cylinder_type]} • ₹{booking.final_amount || booking.total_amount}
              </p>
            </div>
            <span className="text-[10px] text-muted-foreground/60 flex-shrink-0">
              {moment(booking.created_date).fromNow()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
