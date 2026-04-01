import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Zap, Shield, Clock, Terminal, Activity, Globe, ArrowRight, CheckCircle, Star } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay },
});

export default function Home() {
  return (
    <div className="flex flex-col overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 pt-20 pb-16">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-20"
            style={{ background: "radial-gradient(ellipse, rgba(210,130,30,0.8) 0%, transparent 65%)" }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10"
            style={{ background: "radial-gradient(ellipse, rgba(180,90,15,0.9) 0%, transparent 70%)" }} />
          <div className="absolute bottom-10 right-0 w-[300px] h-[300px] rounded-full opacity-10"
            style={{ background: "radial-gradient(ellipse, rgba(150,70,10,0.9) 0%, transparent 70%)" }} />
        </div>

        {/* Grid overlay for texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,200,100,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,200,100,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <motion.div {...fadeUp()} className="relative z-10 max-w-4xl mx-auto">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-8"
            style={{
              background: "rgba(200, 115, 25, 0.12)",
              border: "1px solid rgba(200, 115, 25, 0.28)",
              color: "hsl(35 90% 70%)",
              backdropFilter: "blur(8px)",
            }}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Premium WhatsApp Bot Hosting
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight leading-[0.95] mb-6">
            <span style={{ color: "hsl(30 15% 94%)" }}>Your Bot,</span>
            <br />
            <span className="text-gradient-amber">Always Online.</span>
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: "hsl(28 12% 56%)" }}>
            Deploy WhatsApp bots in seconds on enterprise infrastructure.
            Zero downtime. Full control. Built for creators who mean business.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link href="/register">
              <Button size="lg" className="h-13 px-10 text-base font-bold glow-amber-sm hover:glow-amber transition-all gap-2">
                Start Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/bots">
              <Button variant="outline" size="lg" className="h-13 px-10 text-base gap-2"
                style={{ borderColor: "rgba(200,115,25,0.35)", color: "hsl(35 90% 72%)" }}>
                Browse Bots
              </Button>
            </Link>
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            {[
              { value: "2,400+", label: "Bots Deployed" },
              { value: "99.9%",  label: "Uptime SLA" },
              { value: "50+",    label: "Countries" },
              { value: "< 60s",  label: "Deploy Time" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl md:text-3xl font-black text-gradient-amber">{s.value}</div>
                <div className="text-xs uppercase tracking-widest mt-0.5" style={{ color: "hsl(28 12% 48%)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Floating bot status card */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="absolute right-[5%] bottom-[12%] hidden xl:block"
        >
          <div className="w-56 p-4 rounded-2xl text-left"
            style={{
              background: "rgba(25,12,3,0.75)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,195,120,0.18)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-semibold" style={{ color: "hsl(35 90% 70%)" }}>GURU-MD Bot</span>
            </div>
            <div className="space-y-1.5 font-mono text-[10px]" style={{ color: "hsl(28 12% 55%)" }}>
              <div>✓ Session connected</div>
              <div>✓ Heroku dyno running</div>
              <div style={{ color: "hsl(35 90% 65%)" }}>→ 128 msgs processed</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -30, rotate: 3 }}
          animate={{ opacity: 1, y: 0, rotate: 3 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="absolute left-[4%] top-[28%] hidden xl:block"
        >
          <div className="w-48 p-3.5 rounded-xl text-left"
            style={{
              background: "rgba(25,12,3,0.70)",
              backdropFilter: "blur(18px)",
              border: "1px solid rgba(255,195,120,0.14)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.45)",
            }}>
            <div className="text-[10px] font-mono mb-2" style={{ color: "hsl(28 12% 45%)" }}>deployment log</div>
            <div className="space-y-1 font-mono text-[9px]" style={{ color: "hsl(35 85% 60%)" }}>
              <div>$ git push heroku main</div>
              <div style={{ color: "hsl(28 12% 55%)" }}>Building source...</div>
              <div>✓ Released v3</div>
              <div style={{ color: "hsl(120 60% 55%)" }}>● Running</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── BENTO FEATURE GRID ───────────────────────────── */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div {...fadeUp()} className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "hsl(35 90% 65%)" }}>Everything you need</p>
            <h2 className="text-3xl md:text-5xl font-black" style={{ color: "hsl(30 15% 94%)" }}>
              Built for power users.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[180px]">

            {/* Large card — Deploy Speed */}
            <motion.div {...fadeUp(0.05)} className="md:col-span-2 md:row-span-1 rounded-2xl p-7 flex flex-col justify-between relative overflow-hidden"
              style={{
                background: "rgba(28, 13, 4, 0.55)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,195,120,0.13)",
                boxShadow: "0 6px 40px rgba(0,0,0,0.45)",
              }}>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <Zap className="w-40 h-40 text-amber-400" />
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(200,115,25,0.15)", border: "1px solid rgba(200,115,25,0.22)" }}>
                <Zap className="w-6 h-6" style={{ color: "hsl(35 90% 65%)" }} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1" style={{ color: "hsl(30 15% 92%)" }}>Deploy in Under 60 Seconds</h3>
                <p className="text-sm" style={{ color: "hsl(28 12% 52%)" }}>
                  Pick a bot, enter your session ID, click Deploy. We handle GitHub builds, Heroku provisioning, and dyno scaling automatically.
                </p>
              </div>
            </motion.div>

            {/* Uptime */}
            <motion.div {...fadeUp(0.1)} className="rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden"
              style={{
                background: "rgba(28, 13, 4, 0.55)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,195,120,0.13)",
                boxShadow: "0 6px 40px rgba(0,0,0,0.45)",
              }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "rgba(200,115,25,0.12)", border: "1px solid rgba(200,115,25,0.20)" }}>
                <Activity className="w-5 h-5" style={{ color: "hsl(35 90% 65%)" }} />
              </div>
              <div>
                <div className="text-3xl font-black text-gradient-amber mb-0.5">99.9%</div>
                <p className="text-xs" style={{ color: "hsl(28 12% 50%)" }}>Guaranteed uptime SLA</p>
              </div>
            </motion.div>

            {/* Live Logs */}
            <motion.div {...fadeUp(0.12)} className="rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden"
              style={{
                background: "rgba(28, 13, 4, 0.55)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,195,120,0.13)",
                boxShadow: "0 6px 40px rgba(0,0,0,0.45)",
              }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "rgba(200,115,25,0.12)", border: "1px solid rgba(200,115,25,0.20)" }}>
                <Terminal className="w-5 h-5" style={{ color: "hsl(35 90% 65%)" }} />
              </div>
              <div>
                <h3 className="text-sm font-bold mb-1" style={{ color: "hsl(30 15% 90%)" }}>Live Log Streaming</h3>
                <p className="text-xs" style={{ color: "hsl(28 12% 50%)" }}>Watch your bot's logs in real-time from the dashboard.</p>
              </div>
            </motion.div>

            {/* Global */}
            <motion.div {...fadeUp(0.14)} className="rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden"
              style={{
                background: "rgba(28, 13, 4, 0.55)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,195,120,0.13)",
                boxShadow: "0 6px 40px rgba(0,0,0,0.45)",
              }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "rgba(200,115,25,0.12)", border: "1px solid rgba(200,115,25,0.20)" }}>
                <Globe className="w-5 h-5" style={{ color: "hsl(35 90% 65%)" }} />
              </div>
              <div>
                <h3 className="text-sm font-bold mb-1" style={{ color: "hsl(30 15% 90%)" }}>Multi-Currency Credits</h3>
                <p className="text-xs" style={{ color: "hsl(28 12% 50%)" }}>GRU credits shown in KES, NGN, USD and more.</p>
              </div>
            </motion.div>

            {/* Security */}
            <motion.div {...fadeUp(0.16)} className="rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden"
              style={{
                background: "rgba(28, 13, 4, 0.55)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,195,120,0.13)",
                boxShadow: "0 6px 40px rgba(0,0,0,0.45)",
              }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "rgba(200,115,25,0.12)", border: "1px solid rgba(200,115,25,0.20)" }}>
                <Shield className="w-5 h-5" style={{ color: "hsl(35 90% 65%)" }} />
              </div>
              <div>
                <h3 className="text-sm font-bold mb-1" style={{ color: "hsl(30 15% 90%)" }}>Encrypted & Private</h3>
                <p className="text-xs" style={{ color: "hsl(28 12% 50%)" }}>Session IDs never exposed. Env vars secured end-to-end.</p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(120,55,10,0.25) 0%, transparent 70%)" }} />

        <div className="container mx-auto max-w-5xl relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "hsl(35 90% 65%)" }}>Simple process</p>
            <h2 className="text-3xl md:text-5xl font-black" style={{ color: "hsl(30 15% 94%)" }}>
              Live in 3 steps.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(200,115,25,0.4), rgba(200,115,25,0.4), transparent)" }} />

            {[
              {
                step: "01",
                icon: <Star className="w-5 h-5" />,
                title: "Create Your Account",
                desc: "Sign up with your name, email and country. No Heroku key needed — just your basic details.",
              },
              {
                step: "02",
                icon: <Shield className="w-5 h-5" />,
                title: "Admin Configures Heroku",
                desc: "Our admin team securely links your dedicated Heroku account to your GURU HOST profile.",
              },
              {
                step: "03",
                icon: <Zap className="w-5 h-5" />,
                title: "Deploy & Go Live",
                desc: "Pick a bot from the catalog, paste your session ID, hit Deploy — your bot is live instantly.",
              },
            ].map((item, i) => (
              <motion.div key={i} {...fadeUp(i * 0.12)}>
                <div className="rounded-2xl p-7 h-full relative"
                  style={{
                    background: "rgba(25,12,3,0.50)",
                    backdropFilter: "blur(18px)",
                    border: "1px solid rgba(255,195,120,0.11)",
                    boxShadow: "0 4px 32px rgba(0,0,0,0.40)",
                  }}>
                  <div className="absolute -top-3 left-7 px-2 py-0.5 rounded text-[10px] font-black tracking-widest"
                    style={{ background: "rgba(200,115,25,0.20)", border: "1px solid rgba(200,115,25,0.28)", color: "hsl(35 90% 68%)" }}>
                    {item.step}
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 mt-2"
                    style={{ background: "rgba(200,115,25,0.12)", border: "1px solid rgba(200,115,25,0.22)", color: "hsl(35 90% 65%)" }}>
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-base mb-2" style={{ color: "hsl(30 15% 92%)" }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "hsl(28 12% 52%)" }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-lg text-center">
          <motion.div {...fadeUp()}>
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "hsl(35 90% 65%)" }}>Pricing</p>
            <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ color: "hsl(30 15% 94%)" }}>
              Simple. Fair. Transparent.
            </h2>
            <p className="text-muted-foreground mb-12">No subscriptions. No surprises. Just GRU credits.</p>
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="relative">
            <div className="absolute inset-0 rounded-3xl opacity-25 blur-3xl"
              style={{ background: "radial-gradient(ellipse, rgba(210,120,25,0.7) 0%, transparent 65%)" }} />

            <div className="relative rounded-3xl p-9 text-left"
              style={{
                background: "rgba(22, 10, 2, 0.72)",
                backdropFilter: "blur(28px) saturate(150%)",
                border: "1px solid rgba(255, 195, 120, 0.22)",
                boxShadow: "0 2px 0 rgba(255,210,150,0.09) inset, 0 24px 80px rgba(0,0,0,0.60)",
              }}>

              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "hsl(35 90% 60%)" }}>Per Deployment</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-7xl font-black text-gradient-amber">50</span>
                    <span className="text-2xl font-bold" style={{ color: "hsl(28 12% 50%)" }}>GRU</span>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-full text-xs font-bold tracking-widest"
                  style={{ background: "rgba(200,115,25,0.18)", border: "1px solid rgba(200,115,25,0.32)", color: "hsl(35 90% 72%)" }}>
                  PREMIUM
                </div>
              </div>

              <ul className="space-y-3.5 mb-8">
                {[
                  "1 completely Free deployment on sign-up",
                  "24/7 Uptime with Heroku enterprise infra",
                  "Live log streaming from dashboard",
                  "Restart, Pause & Resume controls",
                  "Custom environment variables support",
                  "Multi-currency GRU credit display",
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "hsl(35 90% 60%)" }} />
                    <span style={{ color: "hsl(30 15% 84%)" }}>{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register">
                <Button className="w-full h-12 text-base font-bold glow-amber-sm hover:glow-amber transition-all gap-2">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────── */}
      <section className="py-20 px-4 mb-8">
        <motion.div {...fadeUp()}
          className="container mx-auto max-w-4xl rounded-3xl p-12 text-center relative overflow-hidden"
          style={{
            background: "rgba(25, 12, 3, 0.60)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,195,120,0.16)",
            boxShadow: "0 8px 60px rgba(0,0,0,0.50)",
          }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(180,90,15,0.18) 0%, transparent 70%)" }} />
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-5 h-5" style={{ color: "hsl(35 90% 65%)" }} />
              <span className="text-sm font-medium" style={{ color: "hsl(35 90% 65%)" }}>Deploy in under 60 seconds</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ color: "hsl(30 15% 95%)" }}>
              Ready to go live?
            </h2>
            <p className="text-lg mb-8" style={{ color: "hsl(28 12% 54%)" }}>
              Your first deployment is on us. No credit card required.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="h-12 px-10 font-bold glow-amber-sm hover:glow-amber transition-all gap-2">
                  Start for Free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/bots">
                <Button variant="outline" size="lg" className="h-12 px-10"
                  style={{ borderColor: "rgba(200,115,25,0.32)", color: "hsl(35 90% 72%)" }}>
                  Browse Bot Catalog
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
