import { useAuth } from "@/hooks/useAuth";
import { useGetDeployments } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Server, Activity, Plus, CreditCard, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: deployments, isLoading } = useGetDeployments();

  if (!user) return null;

  const activeCount = deployments?.filter(d => d.status === "running").length || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}</p>
        </div>
        <div className="flex gap-4">
          <Link href="/payments">
            <Button variant="outline" className="gap-2">
              <CreditCard className="w-4 h-4" /> Top Up GRU
            </Button>
          </Link>
          <Link href="/deploy">
            <Button className="gap-2 glow-amber-sm hover:glow-amber transition-all">
              <Plus className="w-4 h-4" /> New Deployment
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-card to-background border-primary/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                Available Balance
                <CreditCard className="w-4 h-4 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black mb-1">
                <CurrencyDisplay gru={user.gruCredits} country={user.country} />
              </div>
              <p className="text-xs text-muted-foreground">
                {user.freeDeploymentUsed ? "Free deployment used" : "1 Free deployment available!"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                Total Deployments
                <Server className="w-4 h-4 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black mb-1">{deployments?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Apps managed by GURU HOST</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                Active & Running
                <Activity className="w-4 h-4 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black mb-1 text-primary">{activeCount}</div>
              <p className="text-xs text-muted-foreground">Currently online bots</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Server className="w-6 h-6 text-primary" /> Your Deployments
      </h2>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-card animate-pulse rounded-xl border border-border" />
          ))}
        </div>
      ) : deployments?.length === 0 ? (
        <div className="text-center py-24 bg-card/30 rounded-2xl border border-border border-dashed">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <Server className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Deployments Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            You haven't deployed any bots yet. Browse our catalog or deploy your own custom bot.
          </p>
          <Link href="/bots">
            <Button size="lg" className="glow-amber-sm hover:glow-amber transition-all">Browse Bot Catalog</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deployments?.map((dep, i) => (
            <motion.div 
              key={dep.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/deployments/${dep.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                  <CardContent className="p-6 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                          {dep.appName}
                        </h3>
                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                          ${dep.status === 'running' ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(200,115,25,0.30)]' : 
                            dep.status === 'paused' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                            dep.status === 'crashed' ? 'bg-destructive/20 text-destructive border border-destructive/30' :
                            'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                          }`}
                        >
                          {dep.status}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground font-mono truncate max-w-[250px]">
                        {dep.repoUrl.replace('https://github.com/', '')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Created {new Date(dep.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-card-border flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Power className={`w-5 h-5 ${dep.status === 'running' ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
