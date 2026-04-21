import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Wallet, Shield, Zap, ArrowRight, Flame, Database, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { checkConnection, retrievePublicKey } from "@/lib/freighter";

export default function Landing() {
  const navigate = useNavigate();
  const { login, logout, isAuthenticated } = useAuth();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [publicKey, setPublicKey] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated) setIsWalletConnected(true);
  }, [isAuthenticated]);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      toast({ title: "Connecting Freighter...", description: "Requesting wallet permissions" });
      const allowed = await checkConnection();
      if (!allowed) {
        toast({ title: "Freighter Not Found", description: "Please install Freighter browser extension to continue", variant: "destructive" });
        return;
      }
      const key = await retrievePublicKey();
      setPublicKey(key);
      setIsWalletConnected(true);
      login(); // Also log into app session
      toast({ title: "Wallet Connected", description: `Connected: ${key.slice(0, 6)}...${key.slice(-4)}` });
    } catch (err) {
      console.error(err);
      toast({ title: "Connection Failed", description: err.message || "User rejected the request", variant: "destructive" });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-200 overflow-x-hidden font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-[#0a0c10]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">GasChain <span className="text-primary-foreground/40 font-light mx-1">|</span> LPG Connect</span>
          </div>
          
          <div className="flex items-center gap-4">
            {isWalletConnected ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                  <div className={`h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse`} />
                  {publicKey ? `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}` : "Connected"} • Testnet
                </div>
                <Button onClick={() => navigate('/dashboard')} size="sm" variant="outline" className="rounded-full text-[10px] font-bold h-8">Dashboard</Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-[10px] text-slate-400"
                  onClick={() => {
                    logout();
                    setIsWalletConnected(false);
                  }}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={connectWallet} variant="outline" className="rounded-full border-border/60 hover:bg-white/5 text-xs font-bold h-9">
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Abstract Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto text-center space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-wide text-primary uppercase">
            <Database className="h-3 w-3" /> Blockchain-Powered LPG
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-white leading-tight">
            The Future of <br />
            LPG Distribution
          </h1>
          
          <p className="max-w-2xl mx-auto text-slate-400 text-lg leading-relaxed">
            Book LPG cylinders with Freighter wallet payments on Stellar testnet. <br />
            Every transaction is immutably recorded on-chain for full transparency.
          </p>

          <div className="flex flex-col items-center justify-center gap-6 pt-6">
            {!isWalletConnected ? (
              <Button onClick={connectWallet} disabled={isConnecting} size="lg" className="rounded-2xl h-16 px-12 text-lg font-bold w-full sm:w-auto bg-primary hover:scale-105 transition-transform shadow-2xl shadow-primary/20">
                {isConnecting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            ) : (
              <Button onClick={() => navigate('/book')} size="lg" className="rounded-2xl h-16 px-12 text-lg font-bold w-full sm:w-auto bg-primary hover:scale-105 transition-transform shadow-2xl shadow-primary/20">
                Book & Pay Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={Wallet}
            title="Freighter Payments"
            description="Pay with XLM on Stellar testnet. Booking confirmed only after on-chain transaction success."
          />
          <FeatureCard 
            icon={Shield}
            title="Immutable Records"
            description="Every booking, delivery, and subsidy is cryptographically hashed and stored on the blockchain."
          />
          <FeatureCard 
            icon={Activity}
            title="Real-Time Tracking"
            description="Watch your cylinder journey live — from warehouse to doorstep with block-by-block updates."
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-border/40">
        <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
        <p className="text-slate-400 text-center mb-16">Three simple steps to get your LPG cylinder</p>
        
        <div className="grid md:grid-cols-3 gap-12 relative text-center">
            {/* Connector Lines */}
            <div className="hidden md:block absolute top-10 left-[25%] right-[25%] h-px bg-gradient-to-r from-primary/50 to-primary/10 -z-10" />
            
            <Step number="01" title="Connect Wallet" desc="Connect Freighter wallet and switch to Stellar testnet network." />
            <Step number="02" title="Book & Pay" desc="Fill booking details and pay with XLM via Freighter." />
            <Step number="03" title="Track On-Chain" desc="Monitor real-time blockchain supply chain events for your booking." />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/40 text-center text-slate-500 text-sm">
        <p>© 2026 GasChain Ecosystem. Secured by Blockchain Technology.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:border-primary/30 transition-all group">
      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function Step({ number, title, desc }) {
  return (
    <div className="space-y-4">
      <div className="text-4xl md:text-6xl font-black text-white/5">{number}</div>
      <h4 className="text-lg font-bold text-white uppercase tracking-wider">{title}</h4>
      <p className="text-sm text-slate-400 max-w-[200px] mx-auto leading-relaxed">{desc}</p>
    </div>
  );
}

function Activity({ className }) {
    return <Zap className={className} />;
}
