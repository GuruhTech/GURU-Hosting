import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import {
  useAdminGetStats,
  useAdminGetUsers,
  useAdminGetPayments,
  useAdminGetDeployments,
  useGetBots,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Users, Server, DollarSign, Activity, LogOut, ShieldAlert, CheckCircle,
  XCircle, Key, Loader2, PlusCircle, Pencil, Ban, UserCheck, Search,
  StopCircle, Coins, Settings2, RefreshCw, MinusCircle,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

// ─── Admin API helper ─────────────────────────────────────────────────────────

async function adminFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAdminToken()}`,
      ...(opts.headers as object),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:  "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    approved: "bg-green-500/20  text-green-400  border-green-500/30",
    rejected: "bg-red-500/20    text-red-400    border-red-500/30",
    running:  "bg-green-500/20  text-green-400  border-green-500/30",
    stopped:  "bg-slate-500/20  text-slate-400  border-slate-500/30",
    failed:   "bg-red-500/20    text-red-400    border-red-500/30",
  };
  return <Badge variant="outline" className={map[status] ?? ""}>{status}</Badge>;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAdminLoggedIn()) setLocation("/admin");
  }, [setLocation]);

  const { data: stats, refetch: refetchStats } = useAdminGetStats({
    query: { queryKey: getAdminGetStatsQueryKey(), enabled: isAdminLoggedIn(), refetchInterval: 15000 },
  });
  const { data: users, refetch: refetchUsers } = useAdminGetUsers({
    query: { queryKey: getAdminGetUsersQueryKey(), enabled: isAdminLoggedIn() },
  });
  const { data: payments, refetch: refetchPayments } = useAdminGetPayments({
    query: { queryKey: getAdminGetPaymentsQueryKey(), enabled: isAdminLoggedIn() },
  });
  const { data: deployments, refetch: refetchDeployments } = useAdminGetDeployments({
    query: { queryKey: getAdminGetDeploymentsQueryKey(), enabled: isAdminLoggedIn() },
  });
  const { data: bots, refetch: refetchBots } = useGetBots({
    query: { queryKey: getGetBotsQueryKey(), enabled: isAdminLoggedIn() },
  });

  // ─── Search state ────────────────────────────────────────────────────────
  const [userSearch, setUserSearch] = useState("");
  const [paymentSearch, setPaymentSearch] = useState("");
  const [deploySearch, setDeploySearch] = useState("");

  const filteredUsers = useMemo(() =>
    (users ?? []).filter(u =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
    ), [users, userSearch]);

  const filteredPayments = useMemo(() =>
    (payments ?? []).filter(p =>
      (p.user?.name ?? "").toLowerCase().includes(paymentSearch.toLowerCase()) ||
      (p.user?.email ?? "").toLowerCase().includes(paymentSearch.toLowerCase())
    ), [payments, paymentSearch]);

  const filteredDeployments = useMemo(() =>
    (deployments ?? []).filter(d =>
      d.appName.toLowerCase().includes(deploySearch.toLowerCase()) ||
      String(d.userId).includes(deploySearch)
    ), [deployments, deploySearch]);

  // ─── Fund dialog ─────────────────────────────────────────────────────────
  const [fundDialog, setFundDialog] = useState<{ open: boolean; userId: number | null; userName: string; mode: "add" | "deduct" | "reset" }>({
    open: false, userId: null, userName: "", mode: "add",
  });
  const [fundAmount, setFundAmount] = useState("");
  const [fundLoading, setFundLoading] = useState(false);

  const openFundDialog = (userId: number, userName: string, mode: "add" | "deduct" | "reset") => {
    setFundAmount("");
    setFundDialog({ open: true, userId, userName, mode });
  };

  const handleFundAction = async () => {
    if (!fundDialog.userId) return;
    setFundLoading(true);
    try {
      if (fundDialog.mode === "reset") {
        await adminFetch(`/api/admin/users/${fundDialog.userId}/reset-credits`, { method: "POST" });
        toast.success(`Credits reset to 0 for ${fundDialog.userName}`);
      } else if (fundDialog.mode === "deduct") {
        if (!fundAmount || Number(fundAmount) <= 0) { toast.error("Enter a valid amount"); return; }
        await adminFetch(`/api/admin/users/${fundDialog.userId}/deduct`, {
          method: "POST", body: JSON.stringify({ amount: Number(fundAmount) }),
        });
        toast.success(`Deducted ${fundAmount} GRU from ${fundDialog.userName}`);
      } else {
        if (!fundAmount || Number(fundAmount) <= 0) { toast.error("Enter a valid amount"); return; }
        await adminFetch(`/api/admin/users/${fundDialog.userId}/fund`, {
          method: "POST", body: JSON.stringify({ amount: Number(fundAmount) }),
        });
        toast.success(`Added ${fundAmount} GRU to ${fundDialog.userName}`);
      }
      setFundDialog({ open: false, userId: null, userName: "", mode: "add" });
      queryClient.invalidateQueries({ queryKey: getAdminGetUsersQueryKey() });
      queryClient.invalidateQueries({ queryKey: getAdminGetStatsQueryKey() });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setFundLoading(false);
    }
  };

  // ─── Ban dialog ──────────────────────────────────────────────────────────
  const [banLoading, setBanLoading] = useState<number | null>(null);

  const handleBanToggle = async (userId: number, isBanned: boolean, userName: string) => {
    setBanLoading(userId);
    try {
      await adminFetch(`/api/admin/users/${userId}/${isBanned ? "unban" : "ban"}`, { method: "POST" });
      toast.success(`${userName} has been ${isBanned ? "unbanned" : "banned"}`);
      queryClient.invalidateQueries({ queryKey: getAdminGetUsersQueryKey() });
      queryClient.invalidateQueries({ queryKey: getAdminGetStatsQueryKey() });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBanLoading(null);
    }
  };

  // ─── Heroku key dialog ───────────────────────────────────────────────────
  const [herokuDialog, setHerokuDialog] = useState<{ open: boolean; userId: number | null; userName: string }>({
    open: false, userId: null, userName: "",
  });
  const [herokuKey, setHerokuKey] = useState("");
  const [herokuTeam, setHerokuTeam] = useState("");
  const [herokuLoading, setHerokuLoading] = useState(false);
  const [herokuValidation, setHerokuValidation] = useState<{ type: string; teams: string[] } | null>(null);

  const openHerokuDialog = (userId: number, userName: string) => {
    setHerokuKey(""); setHerokuTeam(""); setHerokuValidation(null);
    setHerokuDialog({ open: true, userId, userName });
  };

  const handleValidateHerokuKey = async (key: string) => {
    if (!key.trim()) return;
    setHerokuLoading(true); setHerokuValidation(null);
    try {
      const data = await adminFetch("/api/admin/heroku-key/validate", {
        method: "POST", body: JSON.stringify({ herokuApiKey: key.trim() }),
      });
      setHerokuValidation({ type: data.type, teams: data.teams || [] });
      toast.success(`Valid ${data.type} key`);
    } catch (err: any) { toast.error(err.message); }
    finally { setHerokuLoading(false); }
  };

  const handleSetHerokuKey = async () => {
    if (!herokuKey.trim() || !herokuDialog.userId) return;
    setHerokuLoading(true);
    try {
      const data = await adminFetch(`/api/admin/users/${herokuDialog.userId}/heroku-key`, {
        method: "POST",
        body: JSON.stringify({ herokuApiKey: herokuKey.trim(), herokuTeam: herokuTeam.trim() || undefined }),
      });
      toast.success(`Heroku key set for ${herokuDialog.userName} (${data.validation?.type})`);
      setHerokuDialog({ open: false, userId: null, userName: "" });
      queryClient.invalidateQueries({ queryKey: getAdminGetUsersQueryKey() });
    } catch (err: any) { toast.error(err.message); }
    finally { setHerokuLoading(false); }
  };

  // ─── Approve payment dialog ──────────────────────────────────────────────
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; paymentId: number | null; amount: number; userName: string }>({
    open: false, paymentId: null, amount: 0, userName: "",
  });
  const [approveCredits, setApproveCredits] = useState("");
  const [approveLoading, setApproveLoading] = useState(false);

  const openApproveDialog = (paymentId: number, amount: number, userName: string) => {
    setApproveCredits(String(amount));
    setApproveDialog({ open: true, paymentId, amount, userName });
  };

  const handleApprove = async () => {
    if (!approveDialog.paymentId) return;
    setApproveLoading(true);
    try {
      await adminFetch(`/api/admin/payments/${approveDialog.paymentId}/approve`, {
        method: "POST",
        body: JSON.stringify({ credits: Number(approveCredits) || approveDialog.amount }),
      });
      toast.success(`Payment approved — ${approveCredits || approveDialog.amount} GRU added to ${approveDialog.userName}`);
      setApproveDialog({ open: false, paymentId: null, amount: 0, userName: "" });
      queryClient.invalidateQueries({ queryKey: getAdminGetPaymentsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getAdminGetStatsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getAdminGetUsersQueryKey() });
    } catch (err: any) { toast.error(err.message); }
    finally { setApproveLoading(false); }
  };

  const handleReject = async (paymentId: number) => {
    try {
      await adminFetch(`/api/admin/payments/${paymentId}/reject`, { method: "POST" });
      toast.success("Payment rejected");
      queryClient.invalidateQueries({ queryKey: getAdminGetPaymentsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getAdminGetStatsQueryKey() });
    } catch (err: any) { toast.error(err.message); }
  };

  // ─── Deployment stop ─────────────────────────────────────────────────────
  const [stopLoading, setStopLoading] = useState<string | null>(null);

  const handleStopDeployment = async (depId: string, appName: string) => {
    setStopLoading(depId);
    try {
      await adminFetch(`/api/admin/deployments/${depId}/stop`, { method: "POST" });
      toast.success(`Deployment "${appName}" stopped`);
      queryClient.invalidateQueries({ queryKey: getAdminGetDeploymentsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getAdminGetStatsQueryKey() });
    } catch (err: any) { toast.error(err.message); }
    finally { setStopLoading(null); }
  };

  // ─── Bot dialogs ─────────────────────────────────────────────────────────
  const [botDialog, setBotDialog] = useState<{
    open: boolean; mode: "add" | "edit"; id?: number;
    name: string; description: string; repoUrl: string; imageUrl: string; features: string;
  }>({ open: false, mode: "add", name: "", description: "", repoUrl: "", imageUrl: "", features: "" });
  const [botLoading, setBotLoading] = useState(false);

  const openAddBot = () => setBotDialog({ open: true, mode: "add", name: "", description: "", repoUrl: "", imageUrl: "", features: "" });
  const openEditBot = (b: any) => setBotDialog({
    open: true, mode: "edit", id: b.id,
    name: b.name, description: b.description, repoUrl: b.repoUrl,
    imageUrl: b.imageUrl ?? "", features: (b.features ?? []).join(", "),
  });

  const handleSaveBot = async () => {
    if (!botDialog.name || !botDialog.description || !botDialog.repoUrl) {
      toast.error("Name, description and repo URL are required"); return;
    }
    setBotLoading(true);
    try {
      const payload = {
        name: botDialog.name,
        description: botDialog.description,
        repoUrl: botDialog.repoUrl,
        imageUrl: botDialog.imageUrl || null,
        features: botDialog.features ? botDialog.features.split(",").map(f => f.trim()).filter(Boolean) : [],
      };
      if (botDialog.mode === "edit" && botDialog.id) {
        await adminFetch(`/api/admin/bots/${botDialog.id}`, { method: "PUT", body: JSON.stringify(payload) });
        toast.success("Bot updated");
      } else {
        await adminFetch("/api/admin/bots", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Bot added to catalog");
      }
      setBotDialog(d => ({ ...d, open: false }));
      queryClient.invalidateQueries({ queryKey: getGetBotsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getAdminGetStatsQueryKey() });
    } catch (err: any) { toast.error(err.message); }
    finally { setBotLoading(false); }
  };

  const handleToggleBot = async (botId: number, current: boolean, name: string) => {
    try {
      await adminFetch(`/api/admin/bots/${botId}`, { method: "PUT", body: JSON.stringify({ isActive: !current }) });
      toast.success(`"${name}" is now ${!current ? "active" : "inactive"}`);
      queryClient.invalidateQueries({ queryKey: getGetBotsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getAdminGetStatsQueryKey() });
    } catch (err: any) { toast.error(err.message); }
  };

  // ─── Platform settings ───────────────────────────────────────────────────
  const [platformKey, setPlatformKey] = useState("");
  const [platformTeam, setPlatformTeam] = useState("");
  const [platformKeyLoading, setPlatformKeyLoading] = useState(false);
  const [platformValidation, setPlatformValidation] = useState<{ type: string; teams: string[] } | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const loadSettings = async () => {
    try {
      const data = await adminFetch("/api/admin/settings");
      setPlatformKey(data.platform_heroku_key ? "••••••••••••••••" : "");
      setPlatformTeam(data.platform_heroku_team ?? "");
      if (data.platform_heroku_type) {
        setPlatformValidation({ type: data.platform_heroku_type, teams: [] });
      }
      setSettingsLoaded(true);
    } catch { /* ignore */ }
  };

  const handleValidatePlatformKey = async () => {
    if (!platformKey || platformKey.startsWith("•")) return;
    setPlatformKeyLoading(true); setPlatformValidation(null);
    try {
      const data = await adminFetch("/api/admin/heroku-key/validate", {
        method: "POST", body: JSON.stringify({ herokuApiKey: platformKey.trim() }),
      });
      setPlatformValidation({ type: data.type, teams: data.teams || [] });
      toast.success(`Valid ${data.type} key`);
    } catch (err: any) { toast.error(err.message); }
    finally { setPlatformKeyLoading(false); }
  };

  const handleSavePlatformKey = async () => {
    if (!platformKey || platformKey.startsWith("•")) {
      toast.error("Enter a new API key to save"); return;
    }
    setPlatformKeyLoading(true);
    try {
      const data = await adminFetch("/api/admin/settings/heroku-key", {
        method: "POST",
        body: JSON.stringify({ herokuApiKey: platformKey.trim(), herokuTeam: platformTeam.trim() || undefined }),
      });
      toast.success(`Platform Heroku key saved (${data.validation?.type})`);
      setPlatformValidation({ type: data.validation.type, teams: data.validation.teams });
      setPlatformKey("••••••••••••••••");
    } catch (err: any) { toast.error(err.message); }
    finally { setPlatformKeyLoading(false); }
  };

  const handleLogout = () => { clearAdminToken(); setLocation("/admin"); };

  if (!isAdminLoggedIn()) return null;

  const pendingPayments = (payments ?? []).filter(p => p.status === "pending");

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
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

      <div className="container mx-auto px-4 mt-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Total Users",       value: stats?.totalUsers ?? 0,        icon: <Users className="w-4 h-4 text-primary" />,          cls: "" },
            { label: "Active Deployments",value: stats?.activeDeployments ?? 0, icon: <Activity className="w-4 h-4 text-green-500" />,      cls: "", sub: `of ${stats?.totalDeployments ?? 0}` },
            { label: "Pending Payments",  value: stats?.pendingPayments ?? 0,   icon: <DollarSign className="w-4 h-4 text-destructive" />, cls: stats?.pendingPayments ? "border-destructive/40 bg-destructive/5" : "" },
            { label: "Total Revenue",     value: `${(stats?.totalRevenue ?? 0).toLocaleString()} GRU`, icon: <Coins className="w-4 h-4 text-yellow-500" />, cls: "" },
            { label: "Bots in Catalog",   value: stats?.botsInCatalog ?? 0,     icon: <Server className="w-4 h-4 text-blue-400" />,         cls: "" },
            { label: "Banned Users",      value: stats?.bannedUsers ?? 0,       icon: <Ban className="w-4 h-4 text-orange-400" />,          cls: stats?.bannedUsers ? "border-orange-400/30" : "" },
          ].map(s => (
            <Card key={s.label} className={`border-border ${s.cls}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
                {s.icon}
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="text-2xl font-bold">{s.value}</div>
                {s.sub && <p className="text-xs text-muted-foreground">{s.sub}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList className="bg-card border border-border flex-wrap h-auto gap-1">
            <TabsTrigger value="payments" className="relative">
              Payments
              {(stats?.pendingPayments ?? 0) > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold w-4 h-4">
                  {stats?.pendingPayments}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="deployments">Deployments</TabsTrigger>
            <TabsTrigger value="bots">Bot Catalog</TabsTrigger>
            <TabsTrigger value="settings" onClick={loadSettings}>
              <Settings2 className="w-3.5 h-3.5 mr-1" /> Settings
            </TabsTrigger>
          </TabsList>

          {/* ── Payments ──────────────────────────────────────────────────── */}
          <TabsContent value="payments">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Payments</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{pendingPayments.length} pending</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                    <Input placeholder="Search user…" className="pl-7 h-9 w-48" value={paymentSearch} onChange={e => setPaymentSearch(e.target.value)} />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => refetchPayments()} title="Refresh"><RefreshCw className="w-4 h-4" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Screenshot</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No payments found</TableCell></TableRow>
                    )}
                    {filteredPayments.map(p => (
                      <TableRow key={p.id} className={p.status === "pending" ? "bg-yellow-500/5" : ""}>
                        <TableCell className="text-xs whitespace-nowrap">{new Date(p.createdAt).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">{p.user?.name}</div>
                          <div className="text-xs text-muted-foreground">{p.user?.email}</div>
                          {p.phoneNumber && <div className="text-xs text-muted-foreground">{p.phoneNumber}</div>}
                        </TableCell>
                        <TableCell className="font-bold text-primary">{p.amount} GRU</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{p.notes ?? "—"}</TableCell>
                        <TableCell>
                          <Dialog>
                            <Button variant="outline" size="sm" onClick={() => {
                              const el = document.getElementById(`proof-${p.id}`);
                              if (el) (el as HTMLDialogElement).showModal?.();
                            }}>View</Button>
                            <DialogContent className="max-w-2xl bg-black p-4">
                              <DialogHeader><DialogTitle>Payment Proof — {p.user?.name}</DialogTitle></DialogHeader>
                              <div className="flex justify-center"><img src={p.screenshotUrl} alt="Proof" className="max-h-[70vh] object-contain rounded" /></div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                        <TableCell><StatusBadge status={p.status} /></TableCell>
                        <TableCell className="text-right">
                          {p.status === "pending" && (
                            <div className="flex gap-1 justify-end">
                              <Button size="sm" variant="outline" className="text-green-500 border-green-500/30 hover:bg-green-500/10 gap-1"
                                onClick={() => openApproveDialog(p.id, p.amount, p.user?.name ?? "")}>
                                <CheckCircle className="w-3.5 h-3.5" /> Approve
                              </Button>
                              <Button size="icon" variant="outline" className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                                onClick={() => handleReject(p.id)}>
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Users ─────────────────────────────────────────────────────── */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                    <Input placeholder="Search users…" className="pl-7 h-9 w-48" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => refetchUsers()} title="Refresh"><RefreshCw className="w-4 h-4" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Heroku</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 && (
                      <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No users found</TableCell></TableRow>
                    )}
                    {filteredUsers.map(u => (
                      <TableRow key={u.id} className={u.isBanned ? "opacity-60" : ""}>
                        <TableCell className="font-mono text-xs">{u.id}</TableCell>
                        <TableCell>
                          <div className="font-medium text-sm flex items-center gap-1.5">
                            {u.name}
                            {u.isAdmin && <Badge variant="outline" className="text-[9px] py-0 px-1 border-destructive text-destructive">ADMIN</Badge>}
                          </div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </TableCell>
                        <TableCell className="text-sm">{u.country}</TableCell>
                        <TableCell className="font-bold text-primary">{u.gruCredits} GRU</TableCell>
                        <TableCell>
                          {u.herokuApiType ? (
                            <Badge variant="outline" className={u.herokuApiType === "team" ? "text-blue-400 border-blue-400/30" : "text-green-400 border-green-400/30"}>
                              {u.herokuApiType}
                            </Badge>
                          ) : <span className="text-xs text-muted-foreground">Not set</span>}
                        </TableCell>
                        <TableCell>
                          {u.isBanned
                            ? <Badge variant="outline" className="text-orange-400 border-orange-400/30">Banned</Badge>
                            : <Badge variant="outline" className="text-green-400 border-green-400/30">Active</Badge>}
                        </TableCell>
                        <TableCell className="text-xs">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end flex-wrap">
                            <Button size="sm" variant="outline" className="text-green-400 border-green-400/20 hover:bg-green-400/10 gap-1"
                              title="Add Credits" onClick={() => openFundDialog(u.id, u.name, "add")}>
                              <PlusCircle className="w-3 h-3" /> Fund
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-400 border-red-400/20 hover:bg-red-400/10 gap-1"
                              title="Deduct Credits" onClick={() => openFundDialog(u.id, u.name, "deduct")}>
                              <MinusCircle className="w-3 h-3" /> Deduct
                            </Button>
                            <Button size="sm" variant="outline" className="text-yellow-400 border-yellow-400/20 hover:bg-yellow-400/10 gap-1"
                              onClick={() => openHerokuDialog(u.id, u.name)}>
                              <Key className="w-3 h-3" /> Heroku
                            </Button>
                            <Button size="sm" variant="outline"
                              className={u.isBanned ? "text-green-400 border-green-400/20 hover:bg-green-400/10" : "text-orange-400 border-orange-400/20 hover:bg-orange-400/10"}
                              disabled={banLoading === u.id}
                              onClick={() => handleBanToggle(u.id, !!u.isBanned, u.name)}>
                              {banLoading === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : u.isBanned ? <UserCheck className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Deployments ───────────────────────────────────────────────── */}
          <TabsContent value="deployments">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>All Deployments</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                    <Input placeholder="Search app/user…" className="pl-7 h-9 w-48" value={deploySearch} onChange={e => setDeploySearch(e.target.value)} />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => refetchDeployments()} title="Refresh"><RefreshCw className="w-4 h-4" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>App Name</TableHead>
                      <TableHead>Bot</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Heroku App</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeployments.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No deployments found</TableCell></TableRow>
                    )}
                    {filteredDeployments.map(d => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium text-sm">{d.appName}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{d.bot?.name ?? "—"}</TableCell>
                        <TableCell><StatusBadge status={d.status} /></TableCell>
                        <TableCell className="font-mono text-xs">{d.userId}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{d.herokuAppId ?? "—"}</TableCell>
                        <TableCell className="text-xs">{new Date(d.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          {d.status === "running" && (
                            <Button size="sm" variant="outline" className="text-red-400 border-red-400/20 hover:bg-red-400/10 gap-1"
                              disabled={stopLoading === d.id}
                              onClick={() => handleStopDeployment(d.id, d.appName)}>
                              {stopLoading === d.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <StopCircle className="w-3 h-3" />}
                              Stop
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Bots ──────────────────────────────────────────────────────── */}
          <TabsContent value="bots">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Bot Catalog</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{bots?.length ?? 0} bots total</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => refetchBots()} title="Refresh"><RefreshCw className="w-4 h-4" /></Button>
                  <Button size="sm" className="gap-1" onClick={openAddBot}>
                    <PlusCircle className="w-4 h-4" /> Add Bot
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Repo URL</TableHead>
                      <TableHead>Features</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(bots ?? []).length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No bots yet</TableCell></TableRow>
                    )}
                    {(bots ?? []).map(b => (
                      <TableRow key={b.id} className={!b.isActive ? "opacity-50" : ""}>
                        <TableCell className="font-medium">{b.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{b.description}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">{b.repoUrl}</TableCell>
                        <TableCell className="text-xs">{(b.features ?? []).slice(0, 3).join(", ")}{(b.features ?? []).length > 3 ? "…" : ""}</TableCell>
                        <TableCell>
                          <Badge variant={b.isActive ? "default" : "secondary"}>{b.isActive ? "Active" : "Inactive"}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button size="sm" variant="outline" className="gap-1" onClick={() => openEditBot(b)}>
                              <Pencil className="w-3 h-3" /> Edit
                            </Button>
                            <Button size="sm" variant="outline"
                              className={b.isActive ? "text-orange-400 border-orange-400/20 hover:bg-orange-400/10" : "text-green-400 border-green-400/20 hover:bg-green-400/10"}
                              onClick={() => handleToggleBot(b.id, b.isActive, b.name)}>
                              {b.isActive ? "Disable" : "Enable"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Settings ──────────────────────────────────────────────────── */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Platform Heroku Key */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-yellow-400" /> Platform Heroku API Key
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    A fallback Heroku key used when a user's personal key is missing or fails.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {platformValidation && (
                    <div className={`rounded p-3 text-sm border ${platformValidation.type === "team" ? "bg-blue-500/10 border-blue-500/30 text-blue-300" : "bg-green-500/10 border-green-500/30 text-green-300"}`}>
                      ✓ Saved key type: <strong>{platformValidation.type}</strong>
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label>Heroku API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="HRKU-… or personal token"
                        value={platformKey}
                        onChange={e => { setPlatformKey(e.target.value); setPlatformValidation(null); }}
                        className="font-mono text-sm"
                      />
                      <Button variant="outline" size="sm" onClick={handleValidatePlatformKey}
                        disabled={platformKeyLoading || !platformKey || platformKey.startsWith("•")} className="shrink-0">
                        {platformKeyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Test"}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Team Name <span className="text-muted-foreground">(optional)</span></Label>
                    <Input placeholder="my-heroku-team" value={platformTeam} onChange={e => setPlatformTeam(e.target.value)} />
                  </div>
                  <Button onClick={handleSavePlatformKey} disabled={platformKeyLoading || !platformKey || platformKey.startsWith("•")} className="w-full gap-2">
                    {platformKeyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                    Save Platform Key
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" onClick={loadSettings}>
                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reload Saved Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" /> Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="gap-2" onClick={() => { refetchStats(); refetchUsers(); refetchPayments(); refetchDeployments(); refetchBots(); }}>
                      <RefreshCw className="w-4 h-4" /> Refresh All Data
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => { queryClient.clear(); toast.success("Cache cleared"); }}>
                      <XCircle className="w-4 h-4" /> Clear Cache
                    </Button>
                  </div>
                  <div className="rounded-md border border-border p-4 space-y-2 text-sm">
                    <p className="font-medium">Platform Summary</p>
                    <div className="grid grid-cols-2 gap-1 text-muted-foreground text-xs">
                      <span>Total Users:</span><span className="text-foreground font-medium">{stats?.totalUsers ?? "—"}</span>
                      <span>Total Deployments:</span><span className="text-foreground font-medium">{stats?.totalDeployments ?? "—"}</span>
                      <span>Active Deployments:</span><span className="text-foreground font-medium">{stats?.activeDeployments ?? "—"}</span>
                      <span>Pending Payments:</span><span className="text-foreground font-medium">{stats?.pendingPayments ?? "—"}</span>
                      <span>Total Revenue:</span><span className="text-foreground font-medium">{(stats?.totalRevenue ?? 0).toLocaleString()} GRU</span>
                      <span>Bots in Catalog:</span><span className="text-foreground font-medium">{stats?.botsInCatalog ?? "—"}</span>
                      <span>Banned Users:</span><span className="text-foreground font-medium">{stats?.bannedUsers ?? "—"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Dialogs ─────────────────────────────────────────────────────────── */}

      {/* Approve Payment */}
      <Dialog open={approveDialog.open} onOpenChange={o => !o && setApproveDialog(d => ({ ...d, open: false }))}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-400" /> Approve Payment</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Approving payment for <strong>{approveDialog.userName}</strong>. Original amount: <strong>{approveDialog.amount} GRU</strong>.
              You can adjust the credits to award below.
            </p>
            <div className="space-y-1">
              <Label>Credits to Award (GRU)</Label>
              <Input type="number" min={0} value={approveCredits} onChange={e => setApproveCredits(e.target.value)} placeholder={String(approveDialog.amount)} />
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setApproveDialog(d => ({ ...d, open: false }))}>Cancel</Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700 gap-1" onClick={handleApprove} disabled={approveLoading}>
                {approveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Approve & Fund
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fund / Deduct / Reset Credits */}
      <Dialog open={fundDialog.open} onOpenChange={o => !o && setFundDialog(d => ({ ...d, open: false }))}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {fundDialog.mode === "add" && <><PlusCircle className="w-5 h-5 text-green-400" /> Add Credits</>}
              {fundDialog.mode === "deduct" && <><MinusCircle className="w-5 h-5 text-red-400" /> Deduct Credits</>}
              {fundDialog.mode === "reset" && <><XCircle className="w-5 h-5 text-orange-400" /> Reset Credits</>}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              User: <strong>{fundDialog.userName}</strong>
            </p>
            {fundDialog.mode !== "reset" && (
              <div className="space-y-1">
                <Label>Amount (GRU)</Label>
                <Input type="number" min={1} value={fundAmount} onChange={e => setFundAmount(e.target.value)} placeholder="e.g. 100" autoFocus />
              </div>
            )}
            {fundDialog.mode === "reset" && (
              <p className="text-sm text-destructive bg-destructive/10 rounded p-3 border border-destructive/20">
                This will set the user's credits to 0. This action cannot be undone.
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setFundDialog(d => ({ ...d, open: false }))}>Cancel</Button>
              <Button
                className={`flex-1 gap-1 ${fundDialog.mode === "add" ? "bg-green-600 hover:bg-green-700" : fundDialog.mode === "deduct" ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"}`}
                onClick={handleFundAction} disabled={fundLoading}>
                {fundLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {fundDialog.mode === "add" ? "Add Credits" : fundDialog.mode === "deduct" ? "Deduct Credits" : "Reset to Zero"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Heroku Key (per user) */}
      <Dialog open={herokuDialog.open} onOpenChange={o => !o && setHerokuDialog(d => ({ ...d, open: false }))}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-yellow-400" /> Set Heroku Key — {herokuDialog.userName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Heroku API Key</Label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="HRKU-XXXXXXXXXX or personal token"
                  value={herokuKey}
                  onChange={e => { setHerokuKey(e.target.value); setHerokuValidation(null); }}
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="sm" onClick={() => handleValidateHerokuKey(herokuKey)}
                  disabled={herokuLoading || !herokuKey.trim()} className="shrink-0">
                  {herokuLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Test"}
                </Button>
              </div>
            </div>
            {herokuValidation && (
              <div className={`rounded p-3 text-sm border ${herokuValidation.type === "team" ? "bg-blue-500/10 border-blue-500/30 text-blue-300" : "bg-green-500/10 border-green-500/30 text-green-300"}`}>
                ✓ Valid {herokuValidation.type} key{herokuValidation.teams.length > 0 ? ` · Teams: ${herokuValidation.teams.join(", ")}` : ""}
              </div>
            )}
            <div className="space-y-1">
              <Label>Team Name <span className="text-muted-foreground">(optional)</span></Label>
              <Input placeholder="e.g. my-team-name" value={herokuTeam} onChange={e => setHerokuTeam(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setHerokuDialog(d => ({ ...d, open: false }))}>Cancel</Button>
              <Button className="flex-1 gap-1" onClick={handleSetHerokuKey} disabled={herokuLoading || !herokuKey.trim()}>
                {herokuLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                Save Key
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Bot */}
      <Dialog open={botDialog.open} onOpenChange={o => !o && setBotDialog(d => ({ ...d, open: false }))}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {botDialog.mode === "add" ? <PlusCircle className="w-5 h-5 text-primary" /> : <Pencil className="w-5 h-5 text-primary" />}
              {botDialog.mode === "add" ? "Add Bot to Catalog" : "Edit Bot"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label>Bot Name *</Label>
              <Input placeholder="e.g. GURU-MD" value={botDialog.name} onChange={e => setBotDialog(d => ({ ...d, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Description *</Label>
              <Textarea placeholder="Short description of the bot…" rows={2} value={botDialog.description} onChange={e => setBotDialog(d => ({ ...d, description: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>GitHub Repo URL *</Label>
              <Input placeholder="https://github.com/org/repo" value={botDialog.repoUrl} onChange={e => setBotDialog(d => ({ ...d, repoUrl: e.target.value }))} className="font-mono text-sm" />
            </div>
            <div className="space-y-1">
              <Label>Image URL <span className="text-muted-foreground">(optional)</span></Label>
              <Input placeholder="https://..." value={botDialog.imageUrl} onChange={e => setBotDialog(d => ({ ...d, imageUrl: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Features <span className="text-muted-foreground">(comma-separated)</span></Label>
              <Input placeholder="Auto-reply, Media download, AI chat" value={botDialog.features} onChange={e => setBotDialog(d => ({ ...d, features: e.target.value }))} />
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="ghost" className="flex-1" onClick={() => setBotDialog(d => ({ ...d, open: false }))}>Cancel</Button>
              <Button className="flex-1 gap-1" onClick={handleSaveBot} disabled={botLoading}>
                {botLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {botDialog.mode === "add" ? "Add Bot" : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
