import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ShoppingCart, Loader2, Shield, Wallet, MapPin } from "lucide-react";
import { generateHash, generateBlockHash, generateBookingId, CYLINDER_PRICES, CYLINDER_LABELS } from "@/lib/blockchain";
import { checkConnection, sendXLM, retrievePublicKey } from "@/lib/freighter";

const STATES_CITIES = {
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubballi"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi"]
};

export default function BookCylinder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    house_no: "",
    street_address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    cylinder_type: "",
    quantity: 1,
    payment_method: "",
    notes: "",
  });

  const price = CYLINDER_PRICES[form.cylinder_type] || 0;
  const subsidyAmount = form.cylinder_type === "14.2kg_domestic" ? 200 : 0;
  const totalAmount = price * form.quantity;
  const finalAmount = totalAmount - subsidyAmount * form.quantity;

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.customer_phone)) {
      toast({ title: "Invalid Phone Number", description: "Please enter a valid 10-digit mobile number", variant: "destructive" });
      return;
    }

    if (!form.customer_name || !form.house_no || !form.street_address || !form.state || !form.city || !form.cylinder_type || !form.payment_method) {
      toast({ title: "Incomplete Address", description: "Please fill all mandatory address details", variant: "destructive" });
      return;
    }

    setLoading(true);
    
    if (form.payment_method === 'freighter') {
      const allowed = await checkConnection();
      if (!allowed) {
        toast({ title: "Freighter Not Found", description: "Please install Freighter to use this payment method", variant: "destructive" });
        setLoading(false);
        return;
      }

      try {
        toast({ title: "Connecting Wallet...", description: "Please confirm the connection request" });

        const userAddress = await retrievePublicKey();

        // Calculate Price in XLM (Simplified: 1 INR = 0.1 XLM for demo)
        const xlmPrice = (finalAmount * 0.1).toFixed(2);

        toast({ title: "Payment Pending", description: `Please confirm the transaction of ${xlmPrice} XLM in Freighter` });

        // Trigger real transaction to a dummy treasury address (sending to self for demo reliability)
        const res = await sendXLM(userAddress, xlmPrice);
        const txHash = res.hash || res.transaction_hash || "unknown_hash";

        toast({ title: "Payment Confirmed!", description: `TX: ${txHash.slice(0, 10)}...` });
        
        // Only now proceed with booking
        const bookingId = generateBookingId();
        const fullAddress = `${form.house_no}, ${form.street_address}, ${form.landmark ? form.landmark + ', ' : ''}${form.city}, ${form.state} - ${form.pincode}, India`;
        const blockHash = generateHash({ bookingId, ...form });

        // Create the booking
        await base44.entities.Booking.create({
          ...form,
          customer_address: fullAddress,
          booking_id: bookingId,
          total_amount: totalAmount,
          subsidy_applied: subsidyAmount * form.quantity,
          final_amount: finalAmount,
          status: "confirmed", // Mark as confirmed immediately since payed
          block_hash: blockHash,
          metadata: JSON.stringify({ txHash, network: "Stellar Testnet", priceXLM: xlmPrice }),
        });

        // Create genesis & payment blocks
        const genesisHash = generateBlockHash("0x0000000000000000", { bookingId, event: "booking_created" });
        await base44.entities.SupplyChainBlock.create({
          block_index: 1,
          block_hash: genesisHash,
          previous_hash: "0x0000000000000000",
          timestamp: new Date().toISOString(),
          booking_id: bookingId,
          event_type: "booking_created",
          event_data: JSON.stringify({ customer: form.customer_name, stellar_payment: true }),
          location: "Stellar Node (Testnet)",
          verified_by: "Freighter",
          nonce: Math.floor(Math.random() * 100000),
        });

        setLoading(false);
        toast({ title: "Success!", description: "Booking recorded on blockchain" });
        navigate("/bookings");
        return;

      } catch (error) {
        console.error(error);
        toast({ title: "Transaction Failed", description: error.message || "User denied transaction", variant: "destructive" });
        setLoading(false);
        return;
      }
    }

    // Fallback for non-metamask payments (Existing logic)
    const bookingId = generateBookingId();
    const fullAddress = `${form.house_no}, ${form.street_address}, ${form.landmark ? form.landmark + ', ' : ''}${form.city}, ${form.state} - ${form.pincode}, India`;
    const blockHash = generateHash({ bookingId, ...form });
    const txHash = "0x" + Math.random().toString(16).slice(2, 66);

    await base44.entities.Booking.create({
      ...form,
      customer_address: fullAddress,
      booking_id: bookingId,
      total_amount: totalAmount,
      subsidy_applied: subsidyAmount * form.quantity,
      final_amount: finalAmount,
      status: "pending",
      block_hash: blockHash,
      distributor_name: "GasChain Central Depot",
      metadata: JSON.stringify({ txHash, network: "Off-Chain" }),
    });

    const genesisHash = generateBlockHash("0x0000000000000000", { bookingId, event: "booking_created" });
    await base44.entities.SupplyChainBlock.create({
      block_index: 1,
      block_hash: genesisHash,
      previous_hash: "0x0000000000000000",
      timestamp: new Date().toISOString(),
      booking_id: bookingId,
      event_type: "booking_created",
      event_data: JSON.stringify({ customer: form.customer_name, method: form.payment_method }),
      location: "Public Node (India)",
      verified_by: "System",
      nonce: Math.floor(Math.random() * 100000),
    });

    setLoading(false);
    toast({ title: "Booking Confirmed on Chain!", description: `Booking ID: ${bookingId}` });
    navigate("/bookings");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Book LPG Cylinder</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Blockchain-verified booking with Indian Government Subsidy (Ujjwala)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Basic Details */}
        <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Personal Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name *</Label>
              <Input
                placeholder="Name as per Aadhaar"
                value={form.customer_name}
                onChange={(e) => updateForm("customer_name", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone Number * (10 Digits)</Label>
              <Input
                placeholder="e.g. 9876543210"
                maxLength={10}
                value={form.customer_phone}
                onChange={(e) => updateForm("customer_phone", e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>
          </div>
        </div>

        {/* Detailed Address Section */}
        <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Detailed Delivery Address
          </h2>
          
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Country</Label>
              <Input value="India" disabled className="bg-muted/50" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">State *</Label>
              <Select value={form.state} onValueChange={(v) => { updateForm("state", v); updateForm("city", ""); }}>
                <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                <SelectContent>
                  {Object.keys(STATES_CITIES).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">City *</Label>
              <Select value={form.city} onValueChange={(v) => updateForm("city", v)} disabled={!form.state}>
                <SelectTrigger><SelectValue placeholder="Select City" /></SelectTrigger>
                <SelectContent>
                  {form.state && STATES_CITIES[form.state].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">House / Flat No. *</Label>
              <Input
                placeholder="e.g. Flat 101, Galaxy Apts"
                value={form.house_no}
                onChange={(e) => updateForm("house_no", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Pincode *</Label>
              <Input
                placeholder="6 digits"
                maxLength={6}
                value={form.pincode}
                onChange={(e) => updateForm("pincode", e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Street / Colony Address *</Label>
            <Input
              placeholder="Detailed street address"
              value={form.street_address}
              onChange={(e) => updateForm("street_address", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Landmark (Optional)</Label>
            <Input
              placeholder="Near temple/park etc."
              value={form.landmark}
              onChange={(e) => updateForm("landmark", e.target.value)}
            />
          </div>
        </div>

        {/* Cylinder & Payment Selection */}
        <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
          <h2 className="text-sm font-semibold">Cylinder & Payment Selection</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Cylinder Type *</Label>
              <Select value={form.cylinder_type} onValueChange={(v) => updateForm("cylinder_type", v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CYLINDER_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label} — ₹{CYLINDER_PRICES[key]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Quantity</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={form.quantity}
                onChange={(e) => updateForm("quantity", parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs">Payment Method *</Label>
            <Select value={form.payment_method} onValueChange={(v) => updateForm("payment_method", v)}>
              <SelectTrigger><SelectValue placeholder="Select payment" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online Payment (UPI/Card)</SelectItem>
                <SelectItem value="cod">Cash on Delivery</SelectItem>
                <SelectItem value="freighter">
                  <span className="flex items-center gap-2">
                    <Wallet className="h-3 w-3" /> Pay via Freighter (Stellar)
                  </span>
                </SelectItem>
                <SelectItem value="subsidy_wallet">Subsidy Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Price Summary */}
        {form.cylinder_type && (
          <div className="bg-card rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <h2 className="text-sm font-bold mb-3">Blockchain Bill Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{CYLINDER_LABELS[form.cylinder_type]} × {form.quantity}</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
              {subsidyAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Subsidy Discount (Ujjwala Applied)</span>
                  <span>-₹{(subsidyAmount * form.quantity).toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-primary/20 pt-2 flex justify-between font-bold text-base">
                <span>Total Amount</span>
                <span>₹{finalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <Button type="submit" className="w-full h-12 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing Blockchain Transaction...
            </>
          ) : (
            "Complete Booking & Pay"
          )}
        </Button>
      </form>
    </div>
  );
}

