import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Shield,
  Clock,
  Terminal,
  Activity,
  Globe,
  ArrowRight,
  CheckCircle,
  Star,
  Bot,
  ServerCrash,
  RotateCcw,
  Eye,
  Cpu,
  ChevronRight,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>;
}

const LOGS = [
  { color: "hsl(28 12% 48%)", text: "$ guru deploy --bot guru-md --session ..." },
  { color: "hsl(35 90% 65%)", text: "→ Provisioning Heroku app..." },
  { color: "hsl(28 12% 48%)", text: "→ Setting environment variables..." },
  { color: "hsl(120 60% 60%)", text: "✓ Build successful (42s)" },
  { color: "hsl(120 60% 60%)", text: "✓ Dyno scaled to eco" },
  { color: "hsl(35 90% 70%)", text: "● Bot is LIVE — guru-bot-7f3a.app" },
];

function TerminalDemo() {
  const [lines, setLines] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const t = setInterval(() => {
      i++;
      setLines(i);
      if (i >= LOGS.length) clearInterval(t);
    }, 420);
    return () => clearInterval(t);
  }, [inView]);

  return (
    <div ref={ref} className="rounded-xl overflow-hidden"
      style={{
        background: "rgba(8, 4, 1, 0.90)",
        border: "1px solid rgba(255,195,120,0.14)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.70)",
      }}>
      <div className="flex items-center gap-1.5 px-4 py-3"
        style={{ borderBottom: "1px solid rgba(255,195,120,0.08)", background: "rgba(255,195,120,0.03)" }}>
        <span className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
        <span className="ml-2 text-xs font-mono" style={{ color: "hsl(28 12% 38%)" }}>guru-host — deploy</span>
      </div>
      <div className="p-5 font-mono text-xs space-y-2 min-h-[160px]">
        {LOGS.slice(0, lines).map((log, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            style={{ color: log.color }}>
            {log.text}
          </motion.div>
        ))}
        {lines < LOGS.length && (
          <span className="inline-block w-2 h-4 align-middle" style={{ background: "hsl(35 90% 65%)", animation: "pulse 1s infinite" }} />
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-[96vh] flex flex-col items-center justify-center text-center px-4 pt-24 pb-20">
        {/* Layered background glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-8%] left-1/2 -translate-x-1/2 w-[1000px] h-[700px] rounded-full"
            style={{ background: "radial-gradient(ellipse, rgba(200,110,20,0.22) 0%, transparent 60%)" }} />
          <div className="absolute top-[30%] left-[-5%] w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(ellipse, rgba(150,70,10,0.12) 0%, transparent 65%)" }} />
          <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] rounded-full"
            style={{ background: "radial-gradient(ellipse, rgba(120,50,8,0.10) 0%, transparent 65%)" }} />
          {/* Grain/noise texture */}
          <div className="absolute inset-0 opacity-[0.028]"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
              backgroundRepeat: "repeat",
              backgroundSize: "128px 128px",
            }} />
        </div>

        <motion.div {...fadeUp()} className="relative z-10 max-w-5xl mx-auto">
          {/* Eyebrow pill */}
          <motion.div {...fadeUp(0.05)}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-8 cursor-default select-none"
            style={{
              background: "rgba(200,110,22,0.10)",
              border: "1px solid rgba(200,110,22,0.28)",
              color: "hsl(35 90% 68%)",
              backdropFilter: "blur(12px)",
            }}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <MessageCircle className="w-3.5 h-3.5" />
            Premium WhatsApp Bot Hosting
          </motion.div>

          {/* Main heading */}
          <motion.h1 {...fadeUp(0.08)}
            className="text-5xl sm:text-7xl md:text-[96px] font-black tracking-tight leading-[0.92] mb-7">
            <span style={{ color: "hsl(30 15% 96%)" }}>Host Your Bot.</span>
            <br />
            <span className="text-gradient-amber">Own the Uptime.</span>
          </motion.h1>

          <motion.p {...fadeUp(0.14)}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
            style={{ color: "hsl(28 12% 56%)" }}>
            Deploy GURU-MD and other WhatsApp bots on enterprise-grade Heroku infrastructure.
            Live logs, one-click restarts, full environment control — all from one dashboard.
          </motion.p>

          {/* CTA row */}
          <motion.div {...fadeUp(0.18)} className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link href="/register">
              <button
                className="group relative inline-flex items-center gap-2.5 px-9 py-4 rounded-xl text-base font-bold transition-all duration-200 overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, hsl(33 82% 58%), hsl(25 85% 45%))",
                  color: "#150a01",
                  boxShadow: "0 0 28px rgba(210,120,25,0.45), 0 4px 20px rgba(0,0,0,0.40)",
                  border: "1px solid rgba(255,210,140,0.22)",
                }}>
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200 rounded-xl" />
                <Sparkles className="w-4 h-4" />
                Start Free — No Card Needed
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
            <Link href="/bots">
              <button
                className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200"
                style={{
                  background: "rgba(255,195,120,0.06)",
                  border: "1px solid rgba(255,195,120,0.20)",
                  color: "hsl(35 85% 72%)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 2px 20px rgba(0,0,0,0.25)",
                }}>
                <Bot className="w-4 h-4" />
                Browse Bot Catalog
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
          </motion.div>

          {/* Stat pills */}
          <motion.div {...fadeUp(0.22)}
            className="inline-flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: <Bot className="w-3.5 h-3.5" />, value: "2,400+", label: "Bots Deployed" },
              { icon: <Activity className="w-3.5 h-3.5" />, value: "99.9%", label: "Uptime" },
              { icon: <Globe className="w-3.5 h-3.5" />, value: "50+", label: "Countries" },
              { icon: <Zap className="w-3.5 h-3.5" />, value: "< 60s", label: "Deploy Time" },
            ].map((s) => (
              <div key={s.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: "rgba(255,195,120,0.06)",
                  border: "1px solid rgba(255,195,120,0.13)",
                  backdropFilter: "blur(8px)",
                }}>
                <span style={{ color: "hsl(35 90% 60%)" }}>{s.icon}</span>
                <span className="text-sm font-bold" style={{ color: "hsl(30 15% 92%)" }}>{s.value}</span>
                <span className="text-xs" style={{ color: "hsl(28 12% 48%)" }}>{s.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating cards */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-[4%] bottom-[14%] hidden xl:block">
          <div className="w-60 p-4 rounded-2xl text-left"
            style={{
              background: "rgba(12,6,1,0.80)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,195,120,0.16)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.60)",
            }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-semibold" style={{ color: "hsl(35 90% 68%)" }}>GURU-MD</span>
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: "rgba(120,255,120,0.10)", color: "hsl(120 60% 60%)", border: "1px solid rgba(120,255,120,0.20)" }}>
                LIVE
              </span>
            </div>
            <div className="space-y-1.5 font-mono text-[10px]" style={{ color: "hsl(28 12% 52%)" }}>
              <div style={{ color: "hsl(120 60% 60%)" }}>✓ Session connected</div>
              <div style={{ color: "hsl(120 60% 60%)" }}>✓ Heroku eco dyno</div>
              <div style={{ color: "hsl(35 90% 65%)" }}>→ 312 msgs today</div>
              <div>↑ 14d 6h uptime</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -30, rotate: 2.5 }}
          animate={{ opacity: 1, y: 0, rotate: 2.5 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-[4%] top-[24%] hidden xl:block">
          <div className="w-52 p-3.5 rounded-xl"
            style={{
              background: "rgba(12,6,1,0.78)",
              backdropFilter: "blur(22px)",
              border: "1px solid rgba(255,195,120,0.13)",
              boxShadow: "0 20px 56px rgba(0,0,0,0.55)",
            }}>
            <div className="text-[10px] font-mono mb-2" style={{ color: "hsl(28 12% 42%)" }}>deploy log</div>
            <div className="space-y-1 font-mono text-[9px]">
              <div style={{ color: "hsl(35 85% 60%)" }}>$ git push heroku main</div>
              <div style={{ color: "hsl(28 12% 48%)" }}>Building source...</div>
              <div style={{ color: "hsl(35 85% 62%)" }}>✓ Released v7</div>
              <div style={{ color: "hsl(120 60% 55%)" }}>● Running · eco dyno</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── LIVE DEPLOY DEMO ──────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div {...fadeUp()} className="text-center mb-10">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "hsl(35 90% 62%)" }}>See it in action</p>
            <h2 className="text-3xl md:text-4xl font-black" style={{ color: "hsl(30 15% 94%)" }}>
              From zero to live in seconds.
            </h2>
          </motion.div>
          <motion.div {...fadeUp(0.1)}>
            <TerminalDemo />
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES BENTO ───────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div {...fadeUp()} className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "hsl(35 90% 62%)" }}>Everything you need</p>
            <h2 className="text-3xl md:text-5xl font-black" style={{ color: "hsl(30 15% 94%)" }}>
              Built for power users.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Large: deploy speed */}
            <motion.div {...fadeUp(0.04)} className="md:col-span-7 rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden min-h-[200px]"
              style={{
                background: "rgba(18, 8, 2, 0.62)",
                backdropFilter: "blur(22px)",
                border: "1px solid rgba(255,195,120,0.13)",
                boxShadow: "0 8px 48px rgba(0,0,0,0.50)",
              }}>
              <div className="absolute -right-6 -bottom-6 opacity-[0.08]">
                <Zap className="w-44 h-44 text-amber-400" />
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "rgba(200,110,22,0.15)", border: "1px solid rgba(200,110,22,0.24)" }}>
                <Zap className="w-6 h-6" style={{ color: "hsl(35 90% 65%)" }} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: "hsl(30 15% 93%)" }}>Deploy in Under 60 Seconds</h3>
                <p className="text-sm leading-relaxed" style={{ color: "hsl(28 12% 52%)" }}>
                  Pick a bot, enter your session ID, click Deploy. We handle GitHub builds, Heroku provisioning, and dyno scaling automatically. No DevOps knowledge required.
                </p>
              </div>
            </motion.div>

            {/* Uptime */}
            <motion.div {...fadeUp(0.08)} className="md:col-span-5 rounded-2xl p-7 flex flex-col justify-between relative overflow-hidden min-h-[200px]"
              style={{
                background: "rgba(18, 8, 2, 0.62)",
                backdropFilter: "blur(22px)",
                border: "1px solid rgba(255,195,120,0.13)",
                boxShadow: "0 8px 48px rgba(0,0,0,0.50)",
              }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(120,255,120,0.08)", border: "1px solid rgba(120,255,120,0.16)" }}>
                <Activity className="w-5 h-5" style={{ color: "hsl(120 60% 60%)" }} />
              </div>
              <div>
                <div className="text-5xl font-black text-gradient-amber mb-1">99.9%</div>
                <p className="text-sm" style={{ color: "hsl(28 12% 50%)" }}>Guaranteed uptime SLA on every deployed bot</p>
              </div>
            </motion.div>

            {/* Logs */}
            <motion.div {...fadeUp(0.10)} className="md:col-span-4 rounded-2xl p-7 flex flex-col justify-between relative overflow-hidden min-h-[160px]"
              style={{
                background: "rgba(18, 8, 2, 0.62)",
                backdropFilter: "blur(22px)",
                border: "1px solid rgba(255,195,120,0.13)",
                boxShadow: "0 8px 48px rgba(0,0,0,0.50)",
              }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(200,110,22,0.12)", border: "1px solid rgba(200,110,22,0.20)" }}>
                <Terminal className="w-5 h-5" style={{ color: "hsl(35 90% 65%)" }} />
              </div>
              <div>
                <h3 className="font-bold text-base mb-1" style={{ color: "hsl(30 15% 92%)" }}>Live Log Streaming</h3>
                <p className="text-xs leading-relaxed" style={{ color: "hsl(28 12% 50%)" }}>Watch your bot's output in real-time from the dashboard. No SSH, no guessing.</p>
              </div>
            </motion.div>

            {/* Controls */}
            <motion.div {...fadeUp(0.12)} className="md:col-span-4 rounded-2xl p-7 flex flex-col justify-between relative overflow-hidden min-h-[160px]"
              style={{
                background: "rgba(18, 8, 2, 0.62)",
                backdropFilter: "blur(22px)",
                border: "1px solid rgba(255,195,120,0.13)",
                boxShadow: "0 8px 48px rgba(0,0,0,0.50)",
              }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(200,110,22,0.12)", border: "1px solid rgba(200,110,22,0.20)" }}>
                <RotateCcw className="w-5 h-5" style={{ color: "hsl(35 90% 65%)" }} />
              </div>
              <div>
                <h3 className="font-bold text-base mb-1" style={{ color: "hsl(30 15% 92%)" }}>Full Deployment Control</h3>
                <p className="text-xs leading-relaxed" style={{ color: "hsl(28 12% 50%)" }}>Restart, pause, resume, and delete bots with one click. You're always in charge.</p>
              </div>
            </motion.div>

            {/* Security */}
            <motion.div {...fadeUp(0.14)} className="md:col-span-4 rounded-2xl p-7 flex flex-col justify-between relative overflow-hidden min-h-[160px]"
              style={{
                background: "rgba(18, 8, 2, 0.62)",
                backdropFilter: "blur(22px)",
                border: "1px solid rgba(255,195,120,0.13)",
                boxShadow: "0 8px 48px rgba(0,0,0,0.50)",
              }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(200,110,22,0.12)", border: "1px solid rgba(200,110,22,0.20)" }}>
                <Shield className="w-5 h-5" style={{ color: "hsl(35 90% 65%)" }} />
              </div>
              <div>
                <h3 className="font-bold text-base mb-1" style={{ color: "hsl(30 15% 92%)" }}>Encrypted & Private</h3>
                <p className="text-xs leading-relaxed" style={{ color: "hsl(28 12% 50%)" }}>Session IDs never exposed. All environment variables secured end-to-end.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS COUNTER ────────────────────────────────── */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(140,60,10,0.12) 0%, transparent 70%)" }} />
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { target: 2400, suffix: "+", label: "Bots Deployed", icon: <Bot className="w-5 h-5" /> },
              { target: 50, suffix: "+", label: "Countries Served", icon: <Globe className="w-5 h-5" /> },
              { target: 99, suffix: ".9%", label: "Average Uptime", icon: <Activity className="w-5 h-5" /> },
              { target: 58, suffix: "s", label: "Avg Deploy Time", icon: <Zap className="w-5 h-5" /> },
            ].map((s) => (
              <motion.div key={s.label} {...fadeUp()} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background: "rgba(200,110,22,0.12)",
                    border: "1px solid rgba(200,110,22,0.22)",
                    color: "hsl(35 90% 65%)",
                  }}>
                  {s.icon}
                </div>
                <div className="text-4xl font-black text-gradient-amber mb-1">
                  <AnimatedNumber target={s.target} suffix={s.suffix} />
                </div>
                <div className="text-xs uppercase tracking-widest" style={{ color: "hsl(28 12% 48%)" }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "hsl(35 90% 62%)" }}>Simple process</p>
            <h2 className="text-3xl md:text-5xl font-black" style={{ color: "hsl(30 15% 94%)" }}>
              Live in 3 steps.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(200,110,22,0.35), rgba(200,110,22,0.35), transparent)" }} />

            {[
              {
                step: "01",
                icon: <Star className="w-5 h-5" />,
                title: "Create Your Account",
                desc: "Sign up with your name, email, and country. Your first deployment is completely free — no credit card required.",
              },
              {
                step: "02",
                icon: <Cpu className="w-5 h-5" />,
                title: "Admin Links Heroku",
                desc: "Our team securely links a dedicated Heroku account to your profile. Fully managed, zero setup hassle.",
              },
              {
                step: "03",
                icon: <Zap className="w-5 h-5" />,
                title: "Deploy & Go Live",
                desc: "Pick a bot from the catalog, paste your session ID, hit Deploy — your bot is live and running in under 60 seconds.",
              },
            ].map((item, i) => (
              <motion.div key={i} {...fadeUp(i * 0.10)}>
                <div className="rounded-2xl p-7 h-full relative"
                  style={{
                    background: "rgba(16, 7, 2, 0.58)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,195,120,0.11)",
                    boxShadow: "0 6px 40px rgba(0,0,0,0.44)",
                  }}>
                  <div className="absolute -top-3.5 left-6 px-2.5 py-0.5 rounded text-[10px] font-black tracking-widest"
                    style={{
                      background: "rgba(200,110,22,0.18)",
                      border: "1px solid rgba(200,110,22,0.30)",
                      color: "hsl(35 90% 68%)",
                    }}>
                    {item.step}
                  </div>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 mt-2"
                    style={{
                      background: "rgba(200,110,22,0.12)",
                      border: "1px solid rgba(200,110,22,0.22)",
                      color: "hsl(35 90% 65%)",
                    }}>
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-base mb-2" style={{ color: "hsl(30 15% 93%)" }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "hsl(28 12% 52%)" }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-xl text-center">
          <motion.div {...fadeUp()}>
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "hsl(35 90% 62%)" }}>Pricing</p>
            <h2 className="text-3xl md:text-5xl font-black mb-3" style={{ color: "hsl(30 15% 94%)" }}>
              Simple. Fair. Transparent.
            </h2>
            <p className="mb-12" style={{ color: "hsl(28 12% 50%)" }}>No subscriptions. No surprises. Pay only when you deploy.</p>
          </motion.div>

          <motion.div {...fadeUp(0.08)} className="relative">
            <div className="absolute inset-0 rounded-3xl blur-3xl opacity-20"
              style={{ background: "radial-gradient(ellipse, rgba(210,120,25,0.8) 0%, transparent 65%)" }} />

            <div className="relative rounded-3xl p-9 text-left overflow-hidden"
              style={{
                background: "rgba(14, 6, 1, 0.80)",
                backdropFilter: "blur(32px) saturate(160%)",
                border: "1px solid rgba(255, 195, 120, 0.20)",
                boxShadow: "0 2px 0 rgba(255,210,150,0.08) inset, 0 28px 90px rgba(0,0,0,0.65)",
              }}>
              <div className="absolute top-0 inset-x-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, hsl(33 75% 55%), hsl(25 70% 65%), transparent)" }} />

              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "hsl(35 90% 58%)" }}>Per Deployment</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-8xl font-black text-gradient-amber">50</span>
                    <span className="text-2xl font-bold" style={{ color: "hsl(28 12% 48%)" }}>GRU</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: "hsl(28 12% 44%)" }}>≈ KES 50 · NGN 175 · USD 1</p>
                </div>
                <div className="px-3 py-1.5 rounded-full text-xs font-bold tracking-widest mt-1"
                  style={{
                    background: "rgba(200,110,22,0.16)",
                    border: "1px solid rgba(200,110,22,0.30)",
                    color: "hsl(35 90% 72%)",
                  }}>
                  PREMIUM
                </div>
              </div>

              <ul className="space-y-4 mb-9">
                {[
                  "1 completely free deployment on sign-up",
                  "24/7 uptime with Heroku enterprise infrastructure",
                  "Live log streaming from your dashboard",
                  "Restart, Pause & Resume controls",
                  "Custom environment variables",
                  "Multi-currency GRU credit display (KES, NGN, USD…)",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "hsl(35 90% 60%)" }} />
                    <span style={{ color: "hsl(30 15% 84%)" }}>{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register">
                <button
                  className="group relative w-full inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold transition-all duration-200 overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, hsl(33 82% 58%), hsl(25 85% 44%))",
                    color: "#150a01",
                    boxShadow: "0 0 28px rgba(210,120,25,0.38), 0 4px 20px rgba(0,0,0,0.40)",
                    border: "1px solid rgba(255,210,140,0.20)",
                  }}>
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200 rounded-xl" />
                  <Sparkles className="w-4 h-4" />
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section className="py-20 px-4 mb-8">
        <motion.div {...fadeUp()}
          className="container mx-auto max-w-4xl rounded-3xl p-12 text-center relative overflow-hidden"
          style={{
            background: "rgba(14, 6, 1, 0.72)",
            backdropFilter: "blur(28px)",
            border: "1px solid rgba(255,195,120,0.16)",
            boxShadow: "0 10px 70px rgba(0,0,0,0.55)",
          }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(180,85,14,0.16) 0%, transparent 70%)" }} />
          <div className="absolute top-0 inset-x-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, hsl(33 75% 50%), hsl(25 70% 60%), transparent)" }} />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full"
              style={{
                background: "rgba(200,110,22,0.10)",
                border: "1px solid rgba(200,110,22,0.22)",
              }}>
              <Clock className="w-3.5 h-3.5" style={{ color: "hsl(35 90% 65%)" }} />
              <span className="text-xs font-medium" style={{ color: "hsl(35 90% 65%)" }}>Deploy in under 60 seconds</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ color: "hsl(30 15% 96%)" }}>
              Ready to go live?
            </h2>
            <p className="text-lg mb-10" style={{ color: "hsl(28 12% 54%)" }}>
              Your first deployment is completely free. No credit card. No setup fees.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/register">
                <button
                  className="group relative inline-flex items-center gap-2.5 px-9 py-4 rounded-xl text-base font-bold transition-all duration-200 overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, hsl(33 82% 58%), hsl(25 85% 44%))",
                    color: "#150a01",
                    boxShadow: "0 0 30px rgba(210,120,25,0.40), 0 4px 22px rgba(0,0,0,0.42)",
                    border: "1px solid rgba(255,210,140,0.20)",
                  }}>
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200 rounded-xl" />
                  <Sparkles className="w-4 h-4" />
                  Start for Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
              <Link href="/bots">
                <button
                  className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200"
                  style={{
                    background: "rgba(255,195,120,0.06)",
                    border: "1px solid rgba(255,195,120,0.20)",
                    color: "hsl(35 85% 72%)",
                    backdropFilter: "blur(10px)",
                  }}>
                  <Eye className="w-4 h-4" />
                  Browse Bot Catalog
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
