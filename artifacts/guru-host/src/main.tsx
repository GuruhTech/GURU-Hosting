import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import { getToken, getAdminToken } from "./lib/auth";

const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
if (apiUrl) {
  setBaseUrl(apiUrl);
}

setAuthTokenGetter(() => getAdminToken() || getToken());

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
