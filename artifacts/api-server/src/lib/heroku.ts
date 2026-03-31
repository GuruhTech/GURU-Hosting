const HEROKU_API_BASE = "https://api.heroku.com";

export interface HerokuApp {
  id: string;
  name: string;
  web_url: string;
  dynos: number;
}

function herokuHeaders(apiKey: string) {
  return {
    Accept: "application/vnd.heroku+json; version=3",
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

export async function detectApiType(apiKey: string): Promise<"personal" | "team"> {
  try {
    const res = await fetch(`${HEROKU_API_BASE}/account`, {
      headers: herokuHeaders(apiKey),
    });
    if (res.ok) {
      return "personal";
    }
    const teamRes = await fetch(`${HEROKU_API_BASE}/teams`, {
      headers: herokuHeaders(apiKey),
    });
    if (teamRes.ok) {
      const teams = await teamRes.json() as any[];
      if (teams.length > 0) return "team";
    }
    return "personal";
  } catch {
    return "personal";
  }
}

export async function createHerokuApp(
  apiKey: string,
  appName: string,
  teamName?: string
): Promise<{ id: string; name: string } | null> {
  try {
    const body: any = { name: appName, stack: "heroku-22" };
    if (teamName) {
      body.team = teamName;
    }
    const endpoint = teamName
      ? `${HEROKU_API_BASE}/teams/${teamName}/apps`
      : `${HEROKU_API_BASE}/apps`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: herokuHeaders(apiKey),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json() as any;
      throw new Error(err.message || "Failed to create app");
    }
    const app = await res.json() as any;
    return { id: app.id, name: app.name };
  } catch (e) {
    return null;
  }
}

export async function setHerokuEnvVars(
  apiKey: string,
  appName: string,
  vars: Record<string, string>
): Promise<boolean> {
  try {
    const res = await fetch(`${HEROKU_API_BASE}/apps/${appName}/config-vars`, {
      method: "PATCH",
      headers: herokuHeaders(apiKey),
      body: JSON.stringify(vars),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getHerokuEnvVars(
  apiKey: string,
  appName: string
): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${HEROKU_API_BASE}/apps/${appName}/config-vars`, {
      headers: herokuHeaders(apiKey),
    });
    if (!res.ok) return {};
    return await res.json() as Record<string, string>;
  } catch {
    return {};
  }
}

export async function getHerokuLogs(apiKey: string, appName: string, lines: number = 200): Promise<string> {
  try {
    const sessionRes = await fetch(`${HEROKU_API_BASE}/apps/${appName}/log-sessions`, {
      method: "POST",
      headers: herokuHeaders(apiKey),
      body: JSON.stringify({ lines, tail: false }),
    });
    if (!sessionRes.ok) return "Failed to fetch logs";
    const session = await sessionRes.json() as any;
    const logRes = await fetch(session.logplex_url);
    if (!logRes.ok) return "Failed to fetch log content";
    return await logRes.text();
  } catch (e: any) {
    return `Error fetching logs: ${e.message}`;
  }
}

export async function restartHerokuApp(apiKey: string, appName: string): Promise<boolean> {
  try {
    const res = await fetch(`${HEROKU_API_BASE}/apps/${appName}/dynos`, {
      method: "DELETE",
      headers: herokuHeaders(apiKey),
    });
    return res.ok || res.status === 204;
  } catch {
    return false;
  }
}

export async function scaleHerokuDynos(apiKey: string, appName: string, quantity: number): Promise<boolean> {
  try {
    const res = await fetch(`${HEROKU_API_BASE}/apps/${appName}/formation/web`, {
      method: "PATCH",
      headers: herokuHeaders(apiKey),
      body: JSON.stringify({ quantity }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteHerokuApp(apiKey: string, appName: string): Promise<boolean> {
  try {
    const res = await fetch(`${HEROKU_API_BASE}/apps/${appName}`, {
      method: "DELETE",
      headers: herokuHeaders(apiKey),
    });
    return res.ok || res.status === 200;
  } catch {
    return false;
  }
}

export async function buildFromGitHub(
  apiKey: string,
  appName: string,
  repoUrl: string
): Promise<boolean> {
  try {
    const res = await fetch(`${HEROKU_API_BASE}/apps/${appName}/builds`, {
      method: "POST",
      headers: {
        ...herokuHeaders(apiKey),
        Accept: "application/vnd.heroku+json; version=3.docker-releases",
      },
      body: JSON.stringify({
        source_blob: { url: `${repoUrl}/archive/refs/heads/main.tar.gz` },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getHerokuAppStatus(apiKey: string, appName: string): Promise<string> {
  try {
    const res = await fetch(`${HEROKU_API_BASE}/apps/${appName}/dynos`, {
      headers: herokuHeaders(apiKey),
    });
    if (!res.ok) return "crashed";
    const dynos = await res.json() as any[];
    if (!dynos || dynos.length === 0) return "paused";
    const webDyno = dynos.find((d: any) => d.type === "web");
    if (!webDyno) return "paused";
    if (webDyno.state === "up") return "running";
    if (webDyno.state === "down") return "paused";
    return "building";
  } catch {
    return "crashed";
  }
}
