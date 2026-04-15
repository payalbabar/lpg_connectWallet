import { Database, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { EVENT_LABELS } from "@/lib/blockchain";
import moment from "moment";

export default function RecentBlocks({ blocks }) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-sm font-semibold mb-4">Recent Blockchain Activity</h3>
        <p className="text-sm text-muted-foreground text-center py-8">No blocks yet. Book a cylinder to start!</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Recent Blockchain Activity</h3>
        <Link to="/ledger" className="text-xs text-primary hover:underline flex items-center gap-1">
          View All <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {blocks.slice(0, 5).map((block) => (
          <div key={block.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Database className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">
                {EVENT_LABELS[block.event_type] || block.event_type}
              </p>
              <p className="text-[10px] font-mono text-muted-foreground truncate">{block.block_hash}</p>
            </div>
            <span className="text-[10px] text-muted-foreground/60 flex-shrink-0">
              {moment(block.created_date).fromNow()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
