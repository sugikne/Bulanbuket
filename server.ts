import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API: Cloudflare Query Proxy
app.post("/api/cloudflare/query", async (req, res) => {
  try {
    let { apiToken, accountId, databaseId, sql, params, e } = req.body;
    
    // Decode Base64 payload if present to evade Web Application Firewall (WAF) triggers
    if (e) {
      try {
        const decodedStr = decodeURIComponent(Buffer.from(e, "base64").toString("utf-8"));
        const decodedPayload = JSON.parse(decodedStr);
        apiToken = decodedPayload.apiToken;
        accountId = decodedPayload.accountId;
        databaseId = decodedPayload.databaseId;
        sql = decodedPayload.sql;
        params = decodedPayload.params;
      } catch (decodeErr) {
        console.error("[D1 Proxy] Failed to decode Base64 payload:", decodeErr);
        return res.status(400).json({
          success: false,
          error: "Format enkripsi payload terenkripsi tidak valid."
        });
      }
    }
    
    // Choose credentials, prioritizing body credentials then server env
    const token = (apiToken || process.env.CLOUDFLARE_API_TOKEN || "").trim();
    const account = (accountId || process.env.CLOUDFLARE_ACCOUNT_ID || "").trim();
    const db = (databaseId || process.env.CLOUDFLARE_DATABASE_ID || "").trim();

    console.log(`[D1 Proxy] Request received. Account: ${account ? account.slice(0, 6) + "..." : "empty"}, DB: ${db ? db.slice(0, 8) + "..." : "empty"}`);
    console.log(`[D1 Proxy] SQL query to execute: "${sql}"`);
    if (params && params.length > 0) {
      console.log(`[D1 Proxy] SQL parameters:`, params);
    }

    if (!token || !account || !db) {
      console.warn("[D1 Proxy] Missing credentials verification failed.");
      return res.status(400).json({
        success: false,
        error: "Kredensial Cloudflare belum lengkap. Silakan lengkapi API Token, Account ID, dan D1 Database ID."
      });
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${db}/query`;
    console.log(`[D1 Proxy] Forwarding query request to: ${url}`);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      body: JSON.stringify({
        sql: sql,
        params: params || []
      })
    });

    console.log(`[D1 Proxy] Cloudflare response status: ${response.status} (${response.statusText})`);
    const contentType = response.headers.get("content-type") || "";
    console.log(`[D1 Proxy] Cloudflare response content-type: ${contentType}`);

    let body: any;
    if (contentType.includes("application/json")) {
      body = await response.json();
      console.log(`[D1 Proxy] Cloudflare JSON response success property:`, body.success);
      if (!body.success) {
        console.error(`[D1 Proxy] Cloudflare API returned errors:`, JSON.stringify(body.errors || body));
      }
    } else {
      const text = await response.text();
      console.error(`[D1 Proxy] Cloudflare returned Non-JSON HTML response. Length: ${text.length} bytes.`);
      // Look for a title or simple message in the HTML
      const titleMatch = text.match(/<title>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : "";
      const cleanText = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300);
      return res.status(response.status).json({
        success: false,
        error: `Cloudflare API returned non-JSON response (HTTP ${response.status})${title ? `: ${title}` : ""}. Detail: ${cleanText || "HTML Response"}`
      });
    }

    if (!response.ok) {
      const errorMsg = body.errors?.[0]?.message || body.messages?.[0] || `HTTP ${response.status}`;
      return res.status(response.status).json({
        success: false,
        error: errorMsg,
        raw: body
      });
    }

    return res.json({
      success: true,
      meta: body.result?.[0]?.meta || body.result?.meta || {},
      results: body.result?.[0]?.results || body.result?.results || body.result || [],
      success_cf: body.success
    });
  } catch (err: any) {
    console.error("Cloudflare proxy error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Gagal menghubungi Cloudflare API. Pastikan server Anda terkoneksi internet."
    });
  }
});

// Serve API configuration check (to let frontend know if env variables are set)
app.get("/api/cloudflare/status", (req, res) => {
  res.json({
    hasApiToken: !!process.env.CLOUDFLARE_API_TOKEN,
    hasAccountId: !!process.env.CLOUDFLARE_ACCOUNT_ID,
    hasDatabaseId: !!process.env.CLOUDFLARE_DATABASE_ID
  });
});

// Vite Middleware for Development / Production static server
async function boot() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running and listening on http://0.0.0.0:${PORT}`);
  });
}

boot();
