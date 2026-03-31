import { useGetBots } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, CheckCircle2, ChevronRight, Github } from "lucide-react";

export default function BotsCatalog() {
  const { data: bots, isLoading } = useGetBots();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400">
          Bot Catalog
        </h1>
        <p className="text-muted-foreground text-lg">
          Select a verified WhatsApp bot to deploy instantly on GURU HOST infrastructure.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse h-[400px]">
              <div className="h-48 bg-card-border rounded-t-xl" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots?.filter(b => b.isActive).map((bot, i) => (
            <motion.div
              key={bot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full flex flex-col hover:border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] group overflow-hidden">
                <div className="h-48 bg-card-border relative p-6 flex flex-col justify-end overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                  {bot.imageUrl && (
                    <img src={bot.imageUrl} alt={bot.name} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500" />
                  )}
                  <div className="relative z-20 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center backdrop-blur-sm">
                      <Bot className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">{bot.name}</h2>
                  </div>
                </div>
                
                <CardContent className="flex-1 pt-6">
                  <p className="text-muted-foreground mb-6 line-clamp-3">
                    {bot.description}
                  </p>
                  
                  {bot.features && bot.features.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Features</h4>
                      {bot.features.slice(0, 4).map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="pt-0 border-t border-border mt-auto flex-col gap-3 p-6 bg-card-border/30">
                  <a href={bot.repoUrl} target="_blank" rel="noreferrer" className="w-full">
                    <Button variant="outline" className="w-full gap-2">
                      <Github className="w-4 h-4" /> View Source
                    </Button>
                  </a>
                  <Link href={`/deploy?botId=${bot.id}`} className="w-full">
                    <Button className="w-full gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      Deploy Now <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}

          {/* Custom Repo Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full flex flex-col border-dashed hover:border-primary/50 transition-all hover:bg-card-border/30 group cursor-pointer justify-center items-center text-center p-8">
              <div className="w-20 h-20 rounded-full bg-card-border flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                <Github className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Custom Repository</h2>
              <p className="text-muted-foreground mb-8">
                Deploy your own WhatsApp bot from any public GitHub repository.
              </p>
              <Link href="/deploy" className="w-full">
                <Button variant="outline" className="w-full">
                  Deploy Custom Repo
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
