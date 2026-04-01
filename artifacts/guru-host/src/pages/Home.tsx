import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Zap, Shield, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-36">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-25"
            style={{ background: "radial-gradient(ellipse, rgba(200,115,25,0.55) 0%, transparent 70%)" }} />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-6 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
              style={{
                background: "rgba(200, 115, 25, 0.15)",
                border: "1px solid rgba(200, 115, 25, 0.30)",
                color: "hsl(35 90% 70%)",
                backdropFilter: "blur(8px)",
              }}>
              Premium WhatsApp Bot Hosting
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
              Unstoppable<br />
              <span className="text-gradient-amber">WhatsApp Bots</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Premium 24/7 hosting for WhatsApp bots. Deployed in seconds,
              online forever. Built for serious creators.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="h-12 px-10 text-base font-bold glow-amber-sm hover:glow-amber transition-all">
                  Deploy Now
                </Button>
              </Link>
              <Link href="/bots">
                <Button variant="outline" size="lg"
                  className="h-12 px-10 text-base"
                  style={{ borderColor: "rgba(200,115,25,0.40)", color: "hsl(35 90% 75%)" }}>
                  View Catalog
                </Button>
              </Link>
            </div>

            <p className="mt-5 text-sm text-muted-foreground tracking-wide">
              1 Free Deployment Included • Then 50 GRU per app
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────── */}
      <section className="py-24" style={{ background: "rgba(25,10,3,0.35)", borderTop: "1px solid rgba(255,195,120,0.08)", borderBottom: "1px solid rgba(255,195,120,0.08)", backdropFilter: "blur(10px)" }}>
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-3xl font-bold mb-12 text-gradient-amber"
          >
            Why GURU HOST?
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="w-7 h-7" style={{ color: "hsl(35 90% 65%)" }} />,
                title: "Instant Deployment",
                desc: "Select a bot, enter your session ID, and you're live. No complex server setup required.",
              },
              {
                icon: <Clock className="w-7 h-7" style={{ color: "hsl(35 90% 65%)" }} />,
                title: "24/7 Uptime",
                desc: "Enterprise-grade infrastructure. Your bot never sleeps, misses a message, or drops a connection.",
              },
              {
                icon: <Shield className="w-7 h-7" style={{ color: "hsl(35 90% 65%)" }} />,
                title: "Secure & Private",
                desc: "Session IDs and env variables are encrypted end-to-end. Full control, always.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                viewport={{ once: true }}
                className="p-7 rounded-2xl bg-card border border-border"
              >
                <div className="mb-5 w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(200,115,25,0.12)", border: "1px solid rgba(200,115,25,0.20)" }}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "hsl(30 20% 90%)" }}>{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────── */}
      <section className="py-28">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-3">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground mb-12">No subscriptions. Pay only for what you deploy.</p>

            <div className="max-w-sm mx-auto relative">
              {/* Glow behind card */}
              <div className="absolute inset-0 rounded-3xl opacity-30 blur-2xl"
                style={{ background: "radial-gradient(ellipse, rgba(200,115,25,0.6) 0%, transparent 70%)" }} />

              <div className="relative rounded-3xl p-8 text-left overflow-hidden"
                style={{
                  background: "rgba(25, 12, 3, 0.65)",
                  backdropFilter: "blur(24px) saturate(150%)",
                  border: "1px solid rgba(255, 195, 120, 0.20)",
                  boxShadow: "0 2px 0 rgba(255,210,150,0.09) inset, 0 20px 80px rgba(0,0,0,0.55)",
                }}>

                <div className="absolute top-5 right-5">
                  <span className="px-3 py-1 rounded-full text-xs font-bold tracking-widest"
                    style={{ background: "rgba(200,115,25,0.20)", border: "1px solid rgba(200,115,25,0.35)", color: "hsl(35 90% 72%)" }}>
                    PREMIUM
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-1 uppercase tracking-widest">Standard Bot</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-6xl font-black text-gradient-amber">50</span>
                  <span className="text-xl font-bold text-muted-foreground">GRU / deploy</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    "1 Free Deployment included",
                    "24/7 Uptime Guarantee",
                    "Live Log Streaming",
                    "Custom Environment Variables",
                    "Restart / Pause / Resume Controls",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                        style={{ background: "rgba(200,115,25,0.18)", color: "hsl(35 90% 68%)", border: "1px solid rgba(200,115,25,0.30)" }}>
                        ✓
                      </div>
                      <span style={{ color: "hsl(30 15% 85%)" }}>{item}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register">
                  <Button className="w-full h-11 text-base font-bold glow-amber-sm hover:glow-amber transition-all">
                    Start Free — Deploy Now
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
