import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Server, PlusCircle, CreditCard, Activity, ShieldAlert } from "lucide-react";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";

export function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const [location] = useLocation();

  const isDark = true;

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-primary-foreground text-xl shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            G
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400">
            GURU HOST
          </span>
        </Link>

        {user ? (
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-sm font-medium">
              <Link href="/dashboard" className={`hover:text-primary transition-colors ${location === '/dashboard' ? 'text-primary' : 'text-muted-foreground'}`}>
                <span className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> Dashboard</span>
              </Link>
              <Link href="/bots" className={`hover:text-primary transition-colors ${location === '/bots' ? 'text-primary' : 'text-muted-foreground'}`}>
                <span className="flex items-center gap-2"><Server className="w-4 h-4" /> Catalog</span>
              </Link>
              <Link href="/deploy" className={`hover:text-primary transition-colors ${location === '/deploy' ? 'text-primary' : 'text-muted-foreground'}`}>
                <span className="flex items-center gap-2"><PlusCircle className="w-4 h-4" /> Deploy</span>
              </Link>
              <Link href="/payments" className={`hover:text-primary transition-colors ${location === '/payments' ? 'text-primary' : 'text-muted-foreground'}`}>
                <span className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Top Up</span>
              </Link>
              {isAdmin && (
                <Link href="/admin/dashboard" className={`hover:text-primary transition-colors ${location.startsWith('/admin') ? 'text-primary' : 'text-muted-foreground'}`}>
                  <span className="flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Admin</span>
                </Link>
              )}
            </div>

            <div className="flex items-center gap-4 pl-4 border-l border-border">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <div className="text-xs mt-1">
                  <CurrencyDisplay gru={user.gruCredits} country={user.country} />
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link href="/register">
              <Button className="shadow-[0_0_15px_rgba(16,185,129,0.3)]">Get Started</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
