import { useParams, useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import { 
  useGetDeployment, 
  useGetDeploymentLogs, 
  useGetDeploymentEnv,
  useSetDeploymentEnv,
  useRestartDeployment,
  usePauseDeployment,
  useResumeDeployment,
  useDeleteDeployment,
  getGetDeploymentQueryKey,
  getGetDeploymentLogsQueryKey,
  getGetDeploymentEnvQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Terminal, RefreshCw, Pause, Play, Trash2, Save, Activity, Github } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function DeploymentDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const logsEndRef = useRef<HTMLDivElement>(null);

  const { data: deployment, isLoading } = useGetDeployment(id || "", {
    query: {
      queryKey: getGetDeploymentQueryKey(id || ""),
      enabled: !!id,
      refetchInterval: 5000,
    }
  });

  const { data: logsData } = useGetDeploymentLogs(id || "", { lines: 100 }, {
    query: {
      queryKey: getGetDeploymentLogsQueryKey(id || "", { lines: 100 }),
      enabled: !!id && deployment?.status !== 'deleted',
      refetchInterval: 3000,
    }
  });

  const { data: envVars, isLoading: isEnvLoading } = useGetDeploymentEnv(id || "", {
    query: {
      queryKey: getGetDeploymentEnvQueryKey(id || ""),
      enabled: !!id,
    }
  });

  const restartMut = useRestartDeployment();
  const pauseMut = usePauseDeployment();
  const resumeMut = useResumeDeployment();
  const deleteMut = useDeleteDeployment();
  const setEnvMut = useSetDeploymentEnv();

  const [localEnv, setLocalEnv] = useState<{key: string, value: string}[]>([]);

  useEffect(() => {
    if (envVars) {
      setLocalEnv(envVars);
    }
  }, [envVars]);

  useEffect(() => {
    // Auto-scroll logs
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logsData]);

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading deployment details...</div>;
  if (!deployment) return <div className="p-8 text-center text-destructive">Deployment not found.</div>;

  const handleAction = (action: 'restart' | 'pause' | 'resume' | 'delete') => {
    const mutations = {
      restart: restartMut,
      pause: pauseMut,
      resume: resumeMut,
      delete: deleteMut,
    };
    
    const mut = mutations[action];
    
    if (action === 'delete') {
      if (!confirm("Are you sure you want to delete this deployment? This action cannot be undone.")) return;
    }

    mut.mutate({ id }, {
      onSuccess: () => {
        toast.success(`Deployment ${action}ed successfully`);
        if (action === 'delete') {
          setLocation('/dashboard');
        } else {
          queryClient.invalidateQueries({ queryKey: getGetDeploymentQueryKey(id) });
        }
      },
      onError: (err: any) => {
        toast.error(err.data?.error || `Failed to ${action} deployment`);
      }
    });
  };

  const handleSaveEnv = () => {
    setEnvMut.mutate({ id, data: { vars: localEnv } }, {
      onSuccess: () => {
        toast.success("Environment variables updated. Restarting deployment...");
        // Usually requires restart to take effect, we can trigger restart automatically or let user do it
        queryClient.invalidateQueries({ queryKey: getGetDeploymentQueryKey(id) });
      },
      onError: (err: any) => {
        toast.error(err.data?.error || "Failed to update environment variables");
      }
    });
  };

  const updateLocalEnv = (index: number, field: 'key' | 'value', value: string) => {
    const newEnv = [...localEnv];
    newEnv[index][field] = value;
    setLocalEnv(newEnv);
  };

  const addLocalEnv = () => {
    setLocalEnv([...localEnv, { key: "", value: "" }]);
  };

  const removeLocalEnv = (index: number) => {
    setLocalEnv(localEnv.filter((_, i) => i !== index));
  };

  const statusColors = {
    running: 'text-primary bg-primary/10 border-primary/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
    building: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
    paused: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
    crashed: 'text-destructive bg-destructive/10 border-destructive/30',
    deleted: 'text-muted-foreground bg-muted border-border',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{deployment.appName}</h1>
            <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border ${statusColors[deployment.status]}`}>
              <span className="flex items-center gap-1.5">
                {deployment.status === 'running' && <Activity className="w-3 h-3 animate-pulse" />}
                {deployment.status}
              </span>
            </span>
          </div>
          <a href={deployment.repoUrl} target="_blank" rel="noreferrer" className="text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors text-sm">
            <Github className="w-4 h-4" /> {deployment.repoUrl}
          </a>
        </div>

        <div className="flex gap-2">
          {deployment.status !== 'deleted' && (
            <>
              {deployment.status === 'paused' ? (
                <Button onClick={() => handleAction('resume')} disabled={resumeMut.isPending} variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  <Play className="w-4 h-4 mr-2" /> Resume
                </Button>
              ) : (
                <Button onClick={() => handleAction('pause')} disabled={pauseMut.isPending} variant="outline" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10">
                  <Pause className="w-4 h-4 mr-2" /> Pause
                </Button>
              )}
              <Button onClick={() => handleAction('restart')} disabled={restartMut.isPending} variant="outline">
                <RefreshCw className={`w-4 h-4 mr-2 ${restartMut.isPending ? 'animate-spin' : ''}`} /> Restart
              </Button>
              <Button onClick={() => handleAction('delete')} disabled={deleteMut.isPending} variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border bg-card/50 backdrop-blur overflow-hidden flex flex-col h-[600px]">
            <CardHeader className="border-b border-border bg-background/50 pb-4">
              <CardTitle className="text-sm font-mono flex items-center gap-2 text-muted-foreground">
                <Terminal className="w-4 h-4" /> Application Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 bg-black overflow-hidden relative">
              <div className="absolute inset-0 p-4 overflow-y-auto font-mono text-xs text-green-500/90 whitespace-pre-wrap leading-relaxed">
                {logsData?.lines ? (
                  logsData.lines.map((line, i) => (
                    <div key={i} className="mb-1">{line}</div>
                  ))
                ) : (
                  <div className="text-muted-foreground">Waiting for logs...</div>
                )}
                <div ref={logsEndRef} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>Manage config for this deployment</CardDescription>
            </CardHeader>
            <CardContent>
              {isEnvLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-10 bg-muted rounded"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {localEnv.map((env, i) => (
                    <div key={i} className="flex gap-2">
                      <Input 
                        value={env.key} 
                        onChange={(e) => updateLocalEnv(i, 'key', e.target.value)} 
                        placeholder="KEY" 
                        className="font-mono text-xs w-1/3"
                      />
                      <Input 
                        value={env.value} 
                        onChange={(e) => updateLocalEnv(i, 'value', e.target.value)} 
                        placeholder="Value" 
                        className="font-mono text-xs flex-1"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeLocalEnv(i)} className="text-destructive w-10 shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addLocalEnv} className="w-full border-dashed">
                    + Add Variable
                  </Button>
                  <Button 
                    className="w-full shadow-[0_0_10px_rgba(16,185,129,0.2)]" 
                    onClick={handleSaveEnv}
                    disabled={setEnvMut.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" /> 
                    {setEnvMut.isPending ? 'Saving...' : 'Save & Restart'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Created</span>
                <span>{new Date(deployment.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Bot Type</span>
                <span>{deployment.bot?.name || 'Custom'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono text-xs">{deployment.id.substring(0, 8)}...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
