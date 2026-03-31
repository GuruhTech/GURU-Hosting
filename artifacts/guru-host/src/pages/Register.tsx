import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegister } from "@workspace/api-client-react";
import { setToken } from "@/lib/auth";
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
import { toast } from "sonner";
import { motion } from "framer-motion";

const countries = [
  "Kenya", "Nigeria", "USA", "UK", "Ghana", 
  "Uganda", "Tanzania", "South Africa", 
  "Zimbabwe", "Zambia", "Rwanda", "Ethiopia"
];

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  country: z.string().min(1, "Please select a country"),
  herokuApiKey: z.string().min(10, "Heroku API key is required"),
  herokuTeam: z.string().optional(),
});

export default function Register() {
  const [, setLocation] = useLocation();
  const registerMutation = useRegister();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      country: "",
      herokuApiKey: "",
      herokuTeam: "",
    },
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    // Default currency based on country could be mapped, but backend might handle it or we can pass default
    const data = {
      ...values,
      currency: "USD", // fallback
    };

    registerMutation.mutate({ data }, {
      onSuccess: (res) => {
        setToken(res.token);
        toast.success("Account created successfully! Welcome to GURU HOST.");
        setLocation("/dashboard");
      },
      onError: (err) => {
        toast.error(err.data?.error || "Registration failed");
      }
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl p-8 rounded-2xl bg-card border border-border shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-cyan-500" />
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-muted-foreground">Start hosting your bots with GURU HOST</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} className="bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} className="bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} className="bg-background" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 pb-2 border-b border-border mb-4">
              <h3 className="font-semibold text-lg">Heroku Configuration</h3>
              <p className="text-sm text-muted-foreground">We use your Heroku account to host the bots.</p>
            </div>

            <FormField
              control={form.control}
              name="herokuApiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heroku API Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Account settings > API Key" {...field} className="bg-background" />
                  </FormControl>
                  <FormDescription>Found in your Heroku Account Settings</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="herokuTeam"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heroku Team Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="my-team-name" {...field} className="bg-background" />
                  </FormControl>
                  <FormDescription>If deploying to a team space</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-12 text-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-shadow mt-6"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Creating Account..." : "Register"}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Log in here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
