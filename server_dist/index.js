var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// server/index.ts
import express from "express";

// server/routes.ts
import { createServer } from "node:http";
import * as fs from "node:fs";
import * as path from "node:path";

// server/storage.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, desc } from "drizzle-orm";

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var couples = pgTable("couples", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partner1Name: text("partner1_name").notNull(),
  partner2Name: text("partner2_name").notNull(),
  startDate: text("start_date").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var memories = pgTable("memories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull(),
  title: text("title").notNull(),
  content: text("content"),
  date: text("date").notNull(),
  mood: text("mood"),
  photoUri: text("photo_uri"),
  createdAt: timestamp("created_at").defaultNow()
});
var importantDates = pgTable("important_dates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: varchar("couple_id").notNull(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var insertCoupleSchema = createInsertSchema(couples).pick({
  partner1Name: true,
  partner2Name: true,
  startDate: true
});
var insertMemorySchema = createInsertSchema(memories).pick({
  coupleId: true,
  title: true,
  content: true,
  date: true,
  mood: true,
  photoUri: true
});
var insertImportantDateSchema = createInsertSchema(importantDates).pick({
  coupleId: true,
  title: true,
  date: true,
  type: true
});

// server/storage.ts
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}
var db = drizzle(process.env.DATABASE_URL);
async function getFirstCouple() {
  const result = await db.select().from(couples).limit(1);
  return result[0];
}
async function createCouple(data) {
  const result = await db.insert(couples).values(data).returning();
  return result[0];
}
async function updateCouple(id, data) {
  const result = await db.update(couples).set(data).where(eq(couples.id, id)).returning();
  return result[0];
}
async function getMemories(coupleId) {
  return db.select().from(memories).where(eq(memories.coupleId, coupleId)).orderBy(desc(memories.date));
}
async function createMemory(data) {
  const result = await db.insert(memories).values(data).returning();
  return result[0];
}
async function deleteMemory(id) {
  await db.delete(memories).where(eq(memories.id, id));
}
async function getImportantDates(coupleId) {
  return db.select().from(importantDates).where(eq(importantDates.coupleId, coupleId)).orderBy(desc(importantDates.date));
}
async function createImportantDate(data) {
  const result = await db.insert(importantDates).values(data).returning();
  return result[0];
}
async function deleteImportantDate(id) {
  await db.delete(importantDates).where(eq(importantDates.id, id));
}

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/couple", async (_req, res) => {
    try {
      const couple = await getFirstCouple();
      res.json(couple || null);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/couple", async (req, res) => {
    try {
      const couple = await createCouple(req.body);
      res.status(201).json(couple);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.put("/api/couple/:id", async (req, res) => {
    try {
      const couple = await updateCouple(req.params.id, req.body);
      res.json(couple);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/memories/:coupleId", async (req, res) => {
    try {
      const mems = await getMemories(req.params.coupleId);
      res.json(mems);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/memories", async (req, res) => {
    try {
      const memory = await createMemory(req.body);
      res.status(201).json(memory);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.delete("/api/memories/:id", async (req, res) => {
    try {
      await deleteMemory(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/important-dates/:coupleId", async (req, res) => {
    try {
      const dates = await getImportantDates(req.params.coupleId);
      res.json(dates);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/important-dates", async (req, res) => {
    try {
      const date = await createImportantDate(req.body);
      res.status(201).json(date);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.delete("/api/important-dates/:id", async (req, res) => {
    try {
      await deleteImportantDate(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  function getAllFiles(dir, base) {
    let results = [];
    const skipDirs = /* @__PURE__ */ new Set([".git", "node_modules", ".cache", ".expo", "dist", ".local", ".upm", ".config", "attached_assets", "references"]);
    const skipFiles = /* @__PURE__ */ new Set([".replit", "replit.nix", "replit.md", "generated-icon.png", "package-lock.json"]);
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = path.join(base, entry.name);
      if (entry.isDirectory()) {
        if (skipDirs.has(entry.name)) continue;
        results.push(...getAllFiles(full, rel));
      } else {
        if (skipFiles.has(entry.name)) continue;
        results.push({ full, rel });
      }
    }
    return results;
  }
  app2.get("/github-push", (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>\u0110\u1EA9y Code l\xEAn GitHub</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.card{background:#fff;border-radius:16px;padding:24px;max-width:500px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.3)}
h1{font-size:20px;color:#333;margin-bottom:8px;text-align:center}
p{font-size:14px;color:#666;margin-bottom:16px;text-align:center;line-height:1.5}
label{display:block;font-size:13px;color:#555;margin-bottom:6px;font-weight:600}
input{width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:8px;font-size:14px;margin-bottom:8px;font-family:monospace}
input:focus{outline:none;border-color:#667eea}
.info{background:#f0f4ff;border-radius:8px;padding:12px;margin-bottom:16px;font-size:12px;color:#555;line-height:1.6}
button{width:100%;padding:14px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer}
button:hover{opacity:.9}
button:disabled{opacity:.5;cursor:not-allowed}
#status{margin-top:16px;padding:12px;border-radius:8px;font-size:13px;line-height:1.6;display:none;max-height:300px;overflow-y:auto}
.success{background:#e8f5e9;color:#2e7d32;display:block!important}
.error{background:#fce4ec;color:#c62828;display:block!important}
.loading{background:#fff3e0;color:#e65100;display:block!important}
</style>
</head>
<body>
<div class="card">
<h1>\u{1F680} \u0110\u1EA9y Code l\xEAn GitHub</h1>
<p>\u0110\u1EA9y code \u0110\u1EBFm Ng\xE0y Y\xEAu l\xEAn GitHub \u0111\u1EC3 build APK</p>
<div class="info">
<strong>H\u01B0\u1EDBng d\u1EABn t\u1EA1o token:</strong><br>
1. V\xE0o <a href="https://github.com/settings/tokens/new" target="_blank">github.com/settings/tokens/new</a><br>
2. Note: g\xF5 "replit"<br>
3. Expiration: ch\u1ECDn 90 days<br>
4. T\xEDch \xF4 <strong>repo</strong> V\xC0 <strong>workflow</strong><br>
5. Nh\u1EA5n Generate token<br>
6. Copy token (ghp_...) d\xE1n v\xE0o \xF4 d\u01B0\u1EDBi
</div>
<label>GitHub Token (b\u1EAFt \u0111\u1EA7u b\u1EB1ng ghp_)</label>
<input type="text" id="token" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx">
<label>T\xEAn repo (m\u1EB7c \u0111\u1ECBnh: Love-Counter-Plus)</label>
<input type="text" id="repo" value="Love-Counter-Plus">
<button onclick="pushCode()" id="btn">\u0110\u1EA9y Code l\xEAn GitHub</button>
<div id="status"></div>
</div>
<script>
async function pushCode(){
  const token=document.getElementById('token').value.trim();
  const repo=document.getElementById('repo').value.trim();
  const status=document.getElementById('status');
  const btn=document.getElementById('btn');
  if(!token){status.className='error';status.textContent='Vui l\xF2ng d\xE1n token!';return}
  btn.disabled=true;btn.textContent='\u0110ang \u0111\u1EA9y code...';
  status.className='loading';status.textContent='\u0110ang x\u1EED l\xFD, vui l\xF2ng \u0111\u1EE3i...';
  try{
    const res=await fetch('/api/github-push',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,repo})});
    const data=await res.json();
    if(data.success){
      status.className='success';
      status.innerHTML='\u2705 Th\xE0nh c\xF4ng! Code \u0111\xE3 \u0111\u01B0\u1EE3c \u0111\u1EA9y l\xEAn GitHub!<br><br>'+
        '<a href="https://github.com/'+data.repoFullName+'/actions" target="_blank" style="color:#1565c0">\u{1F449} Nh\u1EA5n v\xE0o \u0111\xE2y \u0111\u1EC3 v\xE0o GitHub Actions</a><br><br>'+
        'Sau \u0111\xF3 nh\u1EA5n n\xFAt "Run workflow" \u0111\u1EC3 build APK.<br>'+
        'Khi build xong (~5-10 ph\xFAt), v\xE0o tab Artifacts \u0111\u1EC3 t\u1EA3i APK.';
    } else {
      status.className='error';status.textContent='\u274C L\u1ED7i: '+data.error;
    }
  }catch(e){status.className='error';status.textContent='\u274C L\u1ED7i k\u1EBFt n\u1ED1i: '+e.message}
  btn.disabled=false;btn.textContent='\u0110\u1EA9y Code l\xEAn GitHub';
}
</script>
</body>
</html>`);
  });
  app2.post("/api/github-push", async (req, res) => {
    const { token, repo } = req.body;
    if (!token || !repo) {
      return res.json({ success: false, error: "Thi\u1EBFu token ho\u1EB7c t\xEAn repo" });
    }
    try {
      const { execSync } = __require("child_process");
      const run = (cmd) => execSync(cmd, { cwd: process.cwd(), timeout: 3e4, stdio: "pipe" }).toString().trim();
      const userRes = await fetch("https://api.github.com/user", {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/vnd.github+json", "User-Agent": "replit-push" }
      });
      const user = await userRes.json();
      if (user.message === "Bad credentials") {
        return res.json({ success: false, error: "Token kh\xF4ng h\u1EE3p l\u1EC7" });
      }
      const username = user.login;
      const repoFullName = `${username}/${repo}`;
      const repoRes = await fetch(`https://api.github.com/repos/${repoFullName}`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/vnd.github+json", "User-Agent": "replit-push" }
      });
      const repoInfo = await repoRes.json();
      if (repoInfo.message === "Not Found") {
        await fetch("https://api.github.com/user/repos", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Accept": "application/vnd.github+json", "User-Agent": "replit-push", "Content-Type": "application/json" },
          body: JSON.stringify({ name: repo, private: false, auto_init: true })
        });
        await new Promise((r) => setTimeout(r, 4e3));
      }
      const tmpDir = "/tmp/git-push-" + Date.now();
      const srcDir = process.cwd();
      const files = getAllFiles(srcDir, "");
      execSync(`mkdir -p ${tmpDir}`, { stdio: "pipe" });
      execSync(`git init ${tmpDir}`, { stdio: "pipe" });
      execSync(`git -C ${tmpDir} config user.email "app@demdayyeu.com"`, { stdio: "pipe" });
      execSync(`git -C ${tmpDir} config user.name "\u0110\u1EBFm Ng\xE0y Y\xEAu"`, { stdio: "pipe" });
      for (const { full, rel } of files) {
        const destPath = path.join(tmpDir, rel);
        const destDir = path.dirname(destPath);
        fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(full, destPath);
      }
      const gitignorePath = path.join(tmpDir, ".gitignore");
      if (fs.existsSync(gitignorePath)) {
        let gi = fs.readFileSync(gitignorePath, "utf8");
        gi = gi.replace(/^android\/$/m, "").replace(/^ios\/$/m, "");
        fs.writeFileSync(gitignorePath, gi);
      }
      execSync(`git -C ${tmpDir} add -A`, { stdio: "pipe" });
      execSync(`git -C ${tmpDir} commit -m "\u0110\u1EBFm Ng\xE0y Y\xEAu - Love Day Counter app"`, { stdio: "pipe" });
      execSync(`git -C ${tmpDir} branch -M main`, { stdio: "pipe" });
      const pushUrl = `https://${token}@github.com/${repoFullName}.git`;
      execSync(`git -C ${tmpDir} remote add origin "${pushUrl}"`, { stdio: "pipe" });
      execSync(`git -C ${tmpDir} push -f origin main`, { stdio: "pipe", timeout: 12e4 });
      execSync(`rm -rf ${tmpDir}`, { stdio: "pipe" });
      return res.json({ success: true, repoFullName, filesCount: files.length });
    } catch (error) {
      console.error("GitHub Push error:", error.message || error);
      const stderr = error.stderr ? error.stderr.toString() : "";
      return res.json({ success: false, error: stderr || error.message || "L\u1ED7i kh\xF4ng x\xE1c \u0111\u1ECBnh" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
import * as fs2 from "fs";
import * as path2 from "path";
var app = express();
var log = console.log;
function setupCors(app2) {
  app2.use((req, res, next) => {
    const origins = /* @__PURE__ */ new Set();
    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }
    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
        origins.add(`https://${d.trim()}`);
      });
    }
    const origin = req.header("origin");
    const isLocalhost = origin?.startsWith("http://localhost:") || origin?.startsWith("http://127.0.0.1:");
    if (origin && (origins.has(origin) || isLocalhost)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header("Access-Control-Allow-Headers", "Content-Type");
      res.header("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
}
function setupBodyParsing(app2) {
  app2.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app2.use(express.urlencoded({ extended: false }));
}
function setupRequestLogging(app2) {
  app2.use((req, res, next) => {
    const start = Date.now();
    const path3 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      if (!path3.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    });
    next();
  });
}
function getAppName() {
  try {
    const appJsonPath = path2.resolve(process.cwd(), "app.json");
    const appJsonContent = fs2.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}
function serveExpoManifest(platform, res) {
  const manifestPath = path2.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json"
  );
  if (!fs2.existsSync(manifestPath)) {
    return res.status(404).json({ error: `Manifest not found for platform: ${platform}` });
  }
  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");
  const manifest = fs2.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}
function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;
  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);
  const html = landingPageTemplate.replace(/BASE_URL_PLACEHOLDER/g, baseUrl).replace(/EXPS_URL_PLACEHOLDER/g, expsUrl).replace(/APP_NAME_PLACEHOLDER/g, appName);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
function configureExpoAndLanding(app2) {
  const templatePath = path2.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html"
  );
  const landingPageTemplate = fs2.readFileSync(templatePath, "utf-8");
  const appName = getAppName();
  log("Serving static Expo files with dynamic manifest routing");
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }
    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }
    if (req.path === "/") {
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName
      });
    }
    next();
  });
  app2.use("/assets", express.static(path2.resolve(process.cwd(), "assets")));
  app2.use(express.static(path2.resolve(process.cwd(), "static-build")));
  log("Expo routing: Checking expo-platform header on / and /manifest");
}
function setupErrorHandler(app2) {
  app2.use((err, _req, res, next) => {
    const error = err;
    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(status).json({ message });
  });
}
(async () => {
  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);
  configureExpoAndLanding(app);
  const server = await registerRoutes(app);
  setupErrorHandler(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      log(`express server serving on port ${port}`);
    }
  );
})();
