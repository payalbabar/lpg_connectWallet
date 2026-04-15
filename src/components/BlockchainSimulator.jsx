import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { generateHash, generateBlockHash, generateBookingId } from "@/lib/blockchain";
import { Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const CUSTOMERS = ["Amit Sharma", "Priya Patel", "Vikram Singh", "Anjali Gupta", "Rahul Verma"];
const TYPES = ["14.2kg_domestic", "19kg_commercial", "5kg_portable"];
const LOCATIONS = ["Central Warehouse", "Regional Depot", "Transit Hub", "Distribution Point"];

export default function BlockchainSimulator() {
  const [isActive, setIsActive] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(async () => {
      const type = Math.random() > 0.3 ? 'booking' : 'status_update';
      
      if (type === 'booking') {
        const id = generateBookingId();
        const hash = generateHash({ id });
        const name = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
        const cylinder = TYPES[Math.floor(Math.random() * TYPES.length)];
        
        await base44.entities.Booking.create({
          booking_id: id,
          customer_name: name,
          customer_phone: "98" + Math.floor(Math.random() * 100000000),
          customer_address: "Sector " + Math.floor(Math.random() * 100) + ", New Delhi",
          cylinder_type: cylinder,
          quantity: 1,
          status: 'pending',
          payment_method: 'online',
          total_amount: 900,
          final_amount: 700,
          block_hash: hash,
        });

        await base44.entities.SupplyChainBlock.create({
          block_index: 1,
          block_hash: hash,
          previous_hash: '0x0000000000000000',
          timestamp: new Date().toISOString(),
          booking_id: id,
          event_type: 'booking_created',
          event_data: JSON.stringify({ customer: name }),
          location: 'Public Node',
          verified_by: 'Consensus',
        });

        setLastEvent(`New Booking ${id}`);
        toast({ title: "Real-time Event", description: `New booking ${id} recorded on chain.` });
      } else {
        const bookings = await base44.entities.Booking.list("-created_date", 20);
        const active = bookings.filter(b => b.status === 'pending');
        
        if (active.length > 0) {
          const b = active[Math.floor(Math.random() * active.length)];
          const nextStatus = 'confirmed';
          const prevHash = b.block_hash;
          const newHash = generateBlockHash(prevHash, { status: nextStatus });

          await base44.entities.Booking.update(b.id, { status: nextStatus, block_hash: newHash });
          await base44.entities.SupplyChainBlock.create({
            block_index: 2,
            block_hash: newHash,
            previous_hash: prevHash,
            timestamp: new Date().toISOString(),
            booking_id: b.booking_id,
            event_type: 'cylinder_assigned',
            event_data: JSON.stringify({ status: nextStatus }),
            location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
            verified_by: 'Warehouse Agent',
          });

          setLastEvent(`Update: ${b.booking_id} → ${nextStatus}`);
        }
      }
    }, 8000); // Every 8 seconds

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`flex items-center gap-3 p-3 rounded-2xl border shadow-2xl transition-all duration-500 bg-card/80 backdrop-blur-xl ${isActive ? 'border-primary/50 ring-4 ring-primary/10' : 'border-border'}`}>
        <div className={`p-2 rounded-xl ${isActive ? 'bg-primary text-primary-foreground animate-pulse' : 'bg-muted text-muted-foreground'}`}>
          <Zap className="h-4 w-4" />
        </div>
        
        <div className="pr-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Blockchain Core</p>
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <p className="text-xs font-semibold">{isActive ? (lastEvent || 'Live Tracking...') : 'Node Standby'}</p>
          </div>
        </div>

        <button 
          onClick={() => setIsActive(!isActive)}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${isActive ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-primary text-primary-foreground hover:shadow-lg hover:scale-105'}`}
        >
          {isActive ? 'STOP NODE' : 'START SIMULATOR'}
        </button>
      </div>
    </div>
  );
}
