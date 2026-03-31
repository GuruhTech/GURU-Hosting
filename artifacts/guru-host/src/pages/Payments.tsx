import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSubmitPayment, useGetPaymentHistory, getGetPaymentHistoryQueryKey } from "@workspace/api-client-react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle, Clock, XCircle, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";

const paymentSchema = z.object({
  amount: z.coerce.number().min(1, "Amount is required"),
  phoneNumber: z.string().optional(),
  notes: z.string().optional(),
  screenshotBase64: z.string().min(1, "Screenshot is required"),
  screenshotMimeType: z.string(),
});

export default function Payments() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: history, isLoading } = useGetPaymentHistory();
  const submitMut = useSubmitPayment();
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      phoneNumber: "",
      notes: "",
      screenshotBase64: "",
      screenshotMimeType: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // The result is something like "data:image/png;base64,iVBORw0K..."
        const parts = base64String.split(';');
        const mimeType = parts[0].split(':')[1];
        const base64Data = parts[1].split(',')[1];
        
        form.setValue("screenshotBase64", base64Data);
        form.setValue("screenshotMimeType", mimeType);
        setFilePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: z.infer<typeof paymentSchema>) => {
    submitMut.mutate({ data: values }, {
      onSuccess: () => {
        toast.success("Payment submitted successfully! Waiting for admin approval.");
        form.reset();
        setFilePreview(null);
        queryClient.invalidateQueries({ queryKey: getGetPaymentHistoryQueryKey() });
      },
      onError: (err) => {
        toast.error(err.data?.error || "Failed to submit payment");
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-primary/20 text-primary border-primary/30"><CheckCircle className="w-3 h-3 mr-1"/> Approved</Badge>;
      case 'pending': return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>;
      case 'rejected': return <Badge className="bg-destructive/20 text-destructive border-destructive/30"><XCircle className="w-3 h-3 mr-1"/> Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400 inline-block">
            Top Up Credits
          </h1>
          <p className="text-muted-foreground mt-2">Submit your M-Pesa or bank transfer screenshot to receive GRU credits.</p>
        </div>
        {user && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <div className="text-2xl font-bold">
              <CurrencyDisplay gru={user.gruCredits} country={user.country} />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="border-primary/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> New Payment
              </CardTitle>
              <CardDescription>
                1. Send payment to our official till.<br/>
                2. Upload screenshot here.<br/>
                3. We approve and credit your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount Paid (Local Currency)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. +254700000000" {...field} className="bg-background" />
                        </FormControl>
                        <FormDescription>If paid via mobile money</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel>Payment Screenshot</FormLabel>
                    <FormControl>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-card-border/50 transition-colors cursor-pointer relative">
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                          onChange={handleFileChange}
                        />
                        {filePreview ? (
                          <div className="relative">
                            <img src={filePreview} alt="Preview" className="max-h-32 mx-auto rounded object-contain" />
                            <div className="mt-2 text-xs text-primary font-medium">Click to change</div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">Click to upload screenshot</p>
                            <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage>{form.formState.errors.screenshotBase64?.message}</FormMessage>
                  </FormItem>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Transaction ID or extra details..." {...field} className="bg-background resize-none" rows={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-shadow font-bold mt-4"
                    disabled={submitMut.isPending || !form.getValues("screenshotBase64")}
                  >
                    {submitMut.isPending ? "Submitting..." : "Submit Payment"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Recent top-up requests and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}
                </div>
              ) : history && history.length > 0 ? (
                <div className="rounded-md border border-border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="text-sm">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-medium">
                            {payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(payment.status)}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs max-w-[200px] truncate">
                            {payment.notes || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
                  No payment history found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
