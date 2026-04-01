import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Server, PlusCircle, CreditCard, ShieldAlert } from "lucide-react";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";

export function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const [location] = useLocation();

  return (
    <nav className="border-b sticky top-0 z-50"
      style={{
        background: "rgba(12, 6, 2, 0.72)",
        backdropFilter: "blur(22px) saturate(140%)",
        WebkitBackdropFilter: "blur(22px) saturate(140%)",
        borderColor: "rgba(255, 195, 120, 0.10)",
      }}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xl"
            style={{
              background: "linear-gradient(135deg, hsl(33 75% 55%), hsl(25 80% 42%))",
              color: "#1a0c02",
              boxShadow: "0 0 14px rgba(200, 115, 25, 0.45)",
            }}>
            G
          </div>
          <span className="text-xl font-bold text-gradient-amber tracking-wide">
            GURU HOST
          </span>
        </Link>

        {user ? (
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-sm font-medium">
              {[
                { href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard" },
                { href: "/bots",      icon: <Server className="w-4 h-4" />,          label: "Catalog" },
                { href: "/deploy",    icon: <PlusCircle className="w-4 h-4" />,       label: "Deploy" },
                { href: "/payments",  icon: <CreditCard className="w-4 h-4" />,       label: "Top Up" },
              ].map(({ href, icon, label }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-1.5 transition-colors"
                  style={{ color: location === href ? "hsl(35 90% 68%)" : "hsl(28 12% 52%)" }}>
                  {icon}{label}
                </Link>
              ))}
              {isAdmin && (
                <Link href="/admin/dashboard"
                  className="flex items-center gap-1.5 transition-colors"
                  style={{ color: location.startsWith('/admin') ? "hsl(35 90% 68%)" : "hsl(28 12% 52%)" }}>
                  <ShieldAlert className="w-4 h-4" /> Admin
                </Link>
              )}
            </div>

            <div className="flex items-center gap-4 pl-4"
              style={{ borderLeft: "1px solid rgba(255,195,120,0.12)" }}>
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium leading-none" style={{ color: "hsl(30 15% 88%)" }}>
                  {user.name}
                </p>
                <div className="text-xs mt-1">
                  <CurrencyDisplay gru={user.gruCredits} country={user.country} />
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout"
                className="text-muted-foreground hover:text-foreground">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button
                style={{
                  background: "linear-gradient(135deg, hsl(33 75% 55%), hsl(25 80% 42%))",
                  color: "#1a0c02",
                  fontWeight: 700,
                  boxShadow: "0 0 16px rgba(200, 115, 25, 0.35)",
                  border: "none",
                }}>
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
