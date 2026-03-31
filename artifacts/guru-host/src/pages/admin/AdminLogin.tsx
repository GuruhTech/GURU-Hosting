import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAdminLogin } from "@workspace/api-client-react";
import { setAdminToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";

const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const loginMutation = useAdminLogin();

  const form = useForm<z.infer<typeof adminLoginSchema>>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof adminLoginSchema>) => {
    loginMutation.mutate({ data: values }, {
      onSuccess: (res) => {
        setAdminToken(res.token);
        toast.success("Admin access granted");
        setLocation("/admin/dashboard");
      },
      onError: (err) => {
        toast.error(err.data?.error || "Admin login failed");
      }
    });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Red/Danger themed background for admin area */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-destructive/10 via-black to-black pointer-events-none" />
      
      <div className="w-full max-w-sm p-8 rounded-2xl bg-card border border-destructive/30 shadow-[0_0_50px_rgba(220,38,38,0.15)] relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-destructive/20 text-destructive rounded-full flex items-center justify-center mx-auto mb-4 border border-destructive/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-widest text-destructive">System Access</h1>
          <p className="text-muted-foreground text-xs mt-2 uppercase tracking-widest">Restricted Area</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Admin ID</FormLabel>
                  <FormControl>
                    <Input placeholder="admin" {...field} className="bg-black border-destructive/20 focus-visible:ring-destructive text-destructive font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Passcode</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} className="bg-black border-destructive/20 focus-visible:ring-destructive text-destructive font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              variant="destructive"
              className="w-full h-12 text-lg tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] transition-shadow uppercase font-bold"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Authenticating..." : "Authorize"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
