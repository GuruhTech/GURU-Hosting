import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { 
  useAdminGetStats, 
  useAdminGetUsers, 
  useAdminGetPayments, 
  useAdminApprovePayment, 
  useAdminRejectPayment,
  useAdminGetDeployments,
  useGetBots,
  useAdminFundUser,
  getAdminGetPaymentsQueryKey,
  getAdminGetStatsQueryKey,
  getAdminGetUsersQueryKey,
  getAdminGetDeploymentsQueryKey,
  getGetBotsQueryKey,
} from "@workspace/api-client-react";
import { isAdminLoggedIn, clearAdminToken, getAdminToken } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Server, DollarSign, Activity, LogOut, ShieldAlert, CheckCircle, XCircle, Key, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Protect route
  useEffect(() => {
    if (!isAdminLoggedIn()) {
      setLocation("/admin");
    }
  }, [setLocation]);

  const { data: stats } = useAdminGetStats({ query: { queryKey: getAdminGetStatsQueryKey(), enabled: isAdminLoggedIn(), refetchInterval: 10000 } });
  const { data: users } = useAdminGetUsers({ query: { queryKey: getAdminGetUsersQueryKey(), enabled: isAdminLoggedIn() } });
  const { data: payments } = useAdminGetPayments({ query: { queryKey: getAdminGetPaymentsQueryKey(), enabled: isAdminLoggedIn() } });
  const { data: deployments } = useAdminGetDeployments({ query: { queryKey: getAdminGetDeploymentsQueryKey(), enabled: isAdminLoggedIn() } });
  const { data: bots } = useGetBots({ query: { queryKey: getGetBotsQueryKey(), enabled: isAdminLoggedIn() } });

  const approveMut = useAdminApprovePayment();
  const rejectMut = useAdminRejectPayment();

  const [herokuKeyDialog, setHerokuKeyDialog] = useState<{ open: boolean; userId: number | null; userName: string }>({
    open: false, userId: null, userName: ""
  });
  const [herokuKeyInput, setHerokuKeyInput] = useState("");
  const [herokuTeamInput, setHerokuTeamInput] = useState("");
  const [herokuKeyLoading, setHerokuKeyLoading] = useState(false);
  const [herokuKeyValidation, setHerokuKeyValidation] = useState<{ type: string; teams: string[] } | null>(null);

  const openHerokuKeyDialog = (userId: number, userName: string) => {
    setHerokuKeyInput("");
    setHerokuTeamInput("");
    setHerokuKeyValidation(null);
    setHerokuKeyDialog({ open: true, userId, userName });
  };

  const handleValidateHerokuKey = async () => {
    if (!herokuKeyInput.trim()) return;
    setHerokuKeyLoading(true);
    setHerokuKeyValidation(null);
    try {
      const res = await fetch("/api/admin/heroku-key/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({ herokuApiKey: herokuKeyInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Validation failed");
      setHerokuKeyValidation({ type: data.type, teams: data.teams || [] });
      toast.success(`Key valid! Type: ${data.type}${data.teams?.length ? `, Teams: ${data.teams.join(", ")}` : ""}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to validate key");
    } finally {
      setHerokuKeyLoading(false);
    }
  };

  const handleSetHerokuKey = async () => {
    if (!herokuKeyInput.trim() || !herokuKeyDialog.userId) return;
    setHerokuKeyLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${herokuKeyDialog.userId}/heroku-key`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({
          herokuApiKey: herokuKeyInput.trim(),
          herokuTeam: herokuTeamInput.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update key");
      toast.success(`Heroku key updated for ${herokuKeyDialog.userName} (${data.validation?.type})`);
      setHerokuKeyDialog({ open: false, userId: null, userName: "" });
      queryClient.invalidateQueries({ queryKey: getAdminGetUsersQueryKey() });
    } catch (err: any) {
      toast.error(err.message || "Failed to set Heroku key");
    } finally {
      setHerokuKeyLoading(false);
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    setLocation("/admin");
  };

  const handleApprovePayment = (id: number) => {
    approveMut.mutate({ id }, {
      onSuccess: () => {
        toast.success("Payment approved and credits added");
        queryClient.invalidateQueries({ queryKey: getAdminGetPaymentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getAdminGetStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getAdminGetUsersQueryKey() });
      }
    });
  };

  const handleRejectPayment = (id: number) => {
    rejectMut.mutate({ id }, {
      onSuccess: () => {
        toast.success("Payment rejected");
        queryClient.invalidateQueries({ queryKey: getAdminGetPaymentsQueryKey() });
      }
    });
  };

  if (!isAdminLoggedIn()) return null;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Admin Header */}
      <div className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-destructive" />
            <span className="font-bold text-xl uppercase tracking-widest">GURU Admin</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Deployments</CardTitle>
              <Activity className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeDeployments || 0}</div>
              <p className="text-xs text-muted-foreground">Out of {stats?.totalDeployments || 0} total</p>
            </CardContent>
          </Card>
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-destructive">Pending Payments</CardTitle>
              <DollarSign className="w-4 h-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats?.pendingPayments || 0}</div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalRevenue.toLocaleString() || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="payments" className="relative">
              Payments
              {stats?.pendingPayments ? (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="deployments">Deployments</TabsTrigger>
            <TabsTrigger value="bots">Bot Catalog</TabsTrigger>
          </TabsList>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Screenshot</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments?.map(payment => (
                      <TableRow key={payment.id}>
                        <TableCell className="text-sm whitespace-nowrap">{new Date(payment.createdAt).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="font-medium">{payment.user?.name}</div>
                          <div className="text-xs text-muted-foreground">{payment.user?.email}</div>
                        </TableCell>
                        <TableCell className="font-bold">{payment.amount}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">View Proof</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl bg-black">
                              <DialogHeader>
                                <DialogTitle>Payment Proof</DialogTitle>
                              </DialogHeader>
                              <div className="flex justify-center p-4">
                                <img src={payment.screenshotUrl} alt="Payment Proof" className="max-h-[70vh] object-contain rounded" />
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                        <TableCell>
                          {payment.status === 'pending' && <Badge className="bg-yellow-500/20 text-yellow-500">Pending</Badge>}
                          {payment.status === 'approved' && <Badge className="bg-green-500/20 text-green-500">Approved</Badge>}
                          {payment.status === 'rejected' && <Badge className="bg-red-500/20 text-red-500">Rejected</Badge>}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {payment.status === 'pending' && (
                            <>
                              <Button size="icon" variant="outline" className="text-green-500 border-green-500/30 hover:bg-green-500/10" onClick={() => handleApprovePayment(payment.id)} disabled={approveMut.isPending}>
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="outline" className="text-red-500 border-red-500/30 hover:bg-red-500/10" onClick={() => handleRejectPayment(payment.id)} disabled={rejectMut.isPending}>
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name/Email</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Heroku</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map(u => (
                      <TableRow key={u.id}>
                        <TableCell className="font-mono text-xs">{u.id}</TableCell>
                        <TableCell>
                          <div className="font-medium flex items-center gap-2">
                            {u.name}
                            {u.isAdmin && <Badge variant="outline" className="text-[10px] py-0 border-destructive text-destructive">ADMIN</Badge>}
                          </div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </TableCell>
                        <TableCell>{u.country}</TableCell>
                        <TableCell className="font-bold text-primary">{u.gruCredits} GRU</TableCell>
                        <TableCell>
                          {u.herokuApiType ? (
                            <Badge variant="outline" className={u.herokuApiType === 'team' ? 'text-blue-400 border-blue-400/30' : 'text-green-400 border-green-400/30'}>
                              {u.herokuApiType}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not set</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-yellow-400 border-yellow-400/30 hover:bg-yellow-400/10 gap-1"
                            onClick={() => openHerokuKeyDialog(u.id, u.name)}
                          >
                            <Key className="w-3 h-3" /> Set Heroku Key
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Heroku Key Dialog */}
            <Dialog open={herokuKeyDialog.open} onOpenChange={(open) => !open && setHerokuKeyDialog({ open: false, userId: null, userName: "" })}>
              <DialogContent className="bg-card border-border max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-yellow-400" />
                    Set Heroku API Key — {herokuKeyDialog.userName}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <Label htmlFor="herokuKey">Heroku API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="herokuKey"
                        placeholder="HRKU-XXXXXXXXXX or personal token"
                        value={herokuKeyInput}
                        onChange={(e) => { setHerokuKeyInput(e.target.value); setHerokuKeyValidation(null); }}
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleValidateHerokuKey}
                        disabled={herokuKeyLoading || !herokuKeyInput.trim()}
                        className="shrink-0"
                      >
                        {herokuKeyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Validate"}
                      </Button>
                    </div>
                  </div>

                  {herokuKeyValidation && (
                    <div className={`rounded-md p-3 text-sm border ${herokuKeyValidation.type === 'team' ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' : 'bg-green-500/10 border-green-500/30 text-green-300'}`}>
                      <div className="font-semibold mb-1">✓ Valid {herokuKeyValidation.type} key</div>
                      {herokuKeyValidation.teams.length > 0 && (
                        <div className="text-xs">Teams: {herokuKeyValidation.teams.join(", ")}</div>
                      )}
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label htmlFor="herokuTeam">Team Name <span className="text-muted-foreground">(optional, for team accounts)</span></Label>
                    <Input
                      id="herokuTeam"
                      placeholder="e.g. my-team-name"
                      value={herokuTeamInput}
                      onChange={(e) => setHerokuTeamInput(e.target.value)}
                    />
                    {herokuKeyValidation?.teams.length ? (
                      <p className="text-xs text-muted-foreground">Detected teams: {herokuKeyValidation.teams.join(", ")}</p>
                    ) : null}
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={() => setHerokuKeyDialog({ open: false, userId: null, userName: "" })}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSetHerokuKey}
                      disabled={herokuKeyLoading || !herokuKeyInput.trim()}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {herokuKeyLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Key className="w-4 h-4 mr-2" />}
                      Save Heroku Key
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="deployments">
            <Card>
              <CardHeader>
                <CardTitle>All Platform Deployments</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>App Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Heroku App</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deployments?.map(d => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.appName}</TableCell>
                        <TableCell>
                           <Badge variant="outline" className={
                             d.status === 'running' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''
                           }>{d.status}</Badge>
                        </TableCell>
                        <TableCell>{d.userId}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{d.herokuAppId || '-'}</TableCell>
                        <TableCell className="text-sm">{new Date(d.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bots">
             <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Bot Catalog (Read Only from DB)</CardTitle>
                <Badge variant="secondary">{bots?.length} Bots</Badge>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Repo</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bots?.map(b => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{b.repoUrl}</TableCell>
                        <TableCell>
                          <Badge variant={b.isActive ? 'default' : 'secondary'}>{b.isActive ? 'Active' : 'Inactive'}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
