import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetBots, useCreateDeployment, getGetDeploymentsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Trash2, Rocket } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

const envVarSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
});

const deploySchema = z.object({
  botId: z.coerce.number().min(1, "Select a bot"),
  repoUrl: z.string().url("Must be a valid URL"),
  sessionId: z.string().min(1, "Session ID is required"),
  envVars: z.array(envVarSchema).optional(),
});

export default function Deploy() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const initialBotId = searchParams.get("botId");
  
  const queryClient = useQueryClient();
  const { data: bots, isLoading: isLoadingBots } = useGetBots();
  const deployMutation = useCreateDeployment();

  const form = useForm<z.infer<typeof deploySchema>>({
    resolver: zodResolver(deploySchema),
    defaultValues: {
      botId: initialBotId ? Number(initialBotId) : 0,
      repoUrl: "",
      sessionId: "",
      envVars: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "envVars",
  });

  // Watch for botId changes to set default repo
  const selectedBotId = form.watch("botId");
  
  useEffect(() => {
    if (selectedBotId && bots) {
      const bot = bots.find((b) => b.id === Number(selectedBotId));
      if (bot && !form.getValues("repoUrl")) {
        form.setValue("repoUrl", bot.repoUrl);
      }
    }
  }, [selectedBotId, bots, form]);

  const onSubmit = (values: z.infer<typeof deploySchema>) => {
    deployMutation.mutate({ data: values }, {
      onSuccess: (res) => {
        toast.success("Deployment started!");
        queryClient.invalidateQueries({ queryKey: getGetDeploymentsQueryKey() });
        setLocation(`/deployments/${res.id}`);
      },
      onError: (err) => {
        toast.error(err.data?.error || "Failed to start deployment");
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400 inline-block">
            New Deployment
          </h1>
          <p className="text-muted-foreground mt-2">Configure and launch your WhatsApp bot.</p>
        </div>

        <Card className="border-border shadow-2xl bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Deployment Configuration</CardTitle>
            <CardDescription>All details are securely encrypted and stored.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="botId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Bot</FormLabel>
                      <Select 
                        disabled={isLoadingBots} 
                        onValueChange={(val) => field.onChange(Number(val))} 
                        value={field.value ? String(field.value) : undefined}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Choose a bot from catalog" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bots?.filter(b => b.isActive).map(b => (
                            <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="repoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repository URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://github.com/user/repo" {...field} className="bg-background font-mono text-sm" />
                      </FormControl>
                      <FormDescription>The public GitHub repository containing the bot code.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sessionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter base64 session ID" {...field} className="bg-background font-mono text-sm" />
                      </FormControl>
                      <FormDescription>Your WhatsApp connection session string.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium">Environment Variables</h3>
                      <p className="text-sm text-muted-foreground">Optional configuration for your bot.</p>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => append({ key: "", value: "" })}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Variable
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-3 items-start">
                        <div className="flex-1">
                          <FormField
                            control={form.control}
                            name={`envVars.${index}.key`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="KEY (e.g. PREFIX)" {...field} className="bg-background font-mono text-sm" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex-1">
                          <FormField
                            control={form.control}
                            name={`envVars.${index}.value`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Value" {...field} className="bg-background font-mono text-sm" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {fields.length === 0 && (
                      <div className="text-center p-4 border border-dashed border-border rounded-lg text-muted-foreground text-sm">
                        No custom variables added.
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6">
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-shadow gap-2 font-bold"
                    disabled={deployMutation.isPending}
                  >
                    <Rocket className="w-5 h-5" />
                    {deployMutation.isPending ? "Deploying..." : "Launch Bot"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
