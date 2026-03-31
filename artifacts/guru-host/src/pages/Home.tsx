import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Server, Zap, Shield, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <section className="relative overflow-hidden pt-24 pb-32">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                Unstoppable <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
                  WhatsApp Bots
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                Premium 24/7 hosting for WhatsApp bots. Deployed in seconds, online forever. Built for serious creators.
              </p>
              
              <div className="flex items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="h-12 px-8 text-lg font-bold shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] transition-all">
                    Deploy Now
                  </Button>
                </Link>
                <Link href="/bots">
                  <Button variant="outline" size="lg" className="h-12 px-8 text-lg border-primary/50 hover:bg-primary/10">
                    View Catalog
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                1 Free Deployment Included • Then 50 GRU per app
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-24 bg-card/30 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="w-8 h-8 text-primary" />,
                  title: "Instant Deployment",
                  desc: "Select a bot, enter your session ID, and you're online. No complex server setup required."
                },
                {
                  icon: <Clock className="w-8 h-8 text-primary" />,
                  title: "24/7 Uptime",
                  desc: "Powered by enterprise-grade infrastructure. Your bot never sleeps, misses a message, or drops a connection."
                },
                {
                  icon: <Shield className="w-8 h-8 text-primary" />,
                  title: "Secure & Private",
                  desc: "Your session IDs and environment variables are encrypted. Full control over your deployments."
                }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-card border border-border shadow-lg hover:border-primary/50 transition-colors"
                >
                  <div className="mb-4 bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-12">Transparent Pricing</h2>
            <div className="max-w-md mx-auto p-8 rounded-3xl bg-gradient-to-b from-card to-background border border-border shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/30">
                  PREMIUM
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Standard Bot</h3>
              <div className="flex items-baseline justify-center gap-2 mb-6">
                <span className="text-5xl font-black">50</span>
                <span className="text-xl text-muted-foreground font-bold">GRU</span>
              </div>
              <ul className="text-left space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">✓</div>
                  <span>1 Free Deployment included</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">✓</div>
                  <span>24/7 Uptime Guarantee</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">✓</div>
                  <span>Live Log Streaming</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">✓</div>
                  <span>Custom Environment Variables</span>
                </li>
              </ul>
              <Link href="/register">
                <Button className="w-full h-12 text-lg">Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
