import type { Express } from "express";
import { createServer, type Server } from "node:http";
import * as https from "node:https";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  getFirstCouple,
  createCouple,
  updateCouple,
  getMemories,
  createMemory,
  deleteMemory,
  getImportantDates,
  createImportantDate,
  deleteImportantDate,
} from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/couple", async (_req, res) => {
    try {
      const couple = await getFirstCouple();
      res.json(couple || null);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/couple", async (req, res) => {
    try {
      const couple = await createCouple(req.body);
      res.status(201).json(couple);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/couple/:id", async (req, res) => {
    try {
      const couple = await updateCouple(req.params.id, req.body);
      res.json(couple);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/memories/:coupleId", async (req, res) => {
    try {
      const mems = await getMemories(req.params.coupleId);
      res.json(mems);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/memories", async (req, res) => {
    try {
      const memory = await createMemory(req.body);
      res.status(201).json(memory);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/memories/:id", async (req, res) => {
    try {
      await deleteMemory(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/important-dates/:coupleId", async (req, res) => {
    try {
      const dates = await getImportantDates(req.params.coupleId);
      res.json(dates);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/important-dates", async (req, res) => {
    try {
      const date = await createImportantDate(req.body);
      res.status(201).json(date);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/important-dates/:id", async (req, res) => {
    try {
      await deleteImportantDate(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  function ghApi(token: string, endpoint: string, data?: unknown, method?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const body = data ? JSON.stringify(data) : null;
      const req = https.request({
        hostname: 'api.github.com',
        path: endpoint,
        method: method || (data ? 'POST' : 'GET'),
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'replit-push',
          ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {})
        }
      }, (res) => {
        let chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString();
          try { resolve(JSON.parse(text)); } catch { resolve({ raw: text }); }
        });
      });
      req.on('error', reject);
      if (body) req.write(body);
      req.end();
    });
  }

  function getAllFiles(dir: string, base: string): Array<{ full: string; rel: string }> {
    let results: Array<{ full: string; rel: string }> = [];
    const skipDirs = new Set(['.git', 'node_modules', '.cache', '.expo', 'dist', '.local', '.upm', '.config', 'attached_assets', 'references']);
    const skipFiles = new Set(['.replit', 'replit.nix', 'replit.md', 'generated-icon.png', 'package-lock.json']);
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

  app.get("/github-push", (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Đẩy Code lên GitHub</title>
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
<h1>🚀 Đẩy Code lên GitHub</h1>
<p>Đẩy code Đếm Ngày Yêu lên GitHub để build APK</p>
<div class="info">
<strong>Hướng dẫn tạo token:</strong><br>
1. Vào <a href="https://github.com/settings/tokens/new" target="_blank">github.com/settings/tokens/new</a><br>
2. Note: gõ "replit"<br>
3. Expiration: chọn 90 days<br>
4. Tích ô <strong>repo</strong><br>
5. Nhấn Generate token<br>
6. Copy token (ghp_...) dán vào ô dưới
</div>
<label>GitHub Token (bắt đầu bằng ghp_)</label>
<input type="text" id="token" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx">
<label>Tên repo (mặc định: Love-Counter-Plus)</label>
<input type="text" id="repo" value="Love-Counter-Plus">
<button onclick="pushCode()" id="btn">Đẩy Code lên GitHub</button>
<div id="status"></div>
</div>
<script>
async function pushCode(){
  const token=document.getElementById('token').value.trim();
  const repo=document.getElementById('repo').value.trim();
  const status=document.getElementById('status');
  const btn=document.getElementById('btn');
  if(!token){status.className='error';status.textContent='Vui lòng dán token!';return}
  btn.disabled=true;btn.textContent='Đang đẩy code...';
  status.className='loading';status.textContent='Đang xử lý, vui lòng đợi...';
  try{
    const res=await fetch('/api/github-push',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,repo})});
    const data=await res.json();
    if(data.success){
      status.className='success';
      status.innerHTML='✅ Thành công! Code đã được đẩy lên GitHub!<br><br>'+
        '<a href="https://github.com/'+data.repoFullName+'/actions" target="_blank" style="color:#1565c0">👉 Nhấn vào đây để vào GitHub Actions</a><br><br>'+
        'Sau đó nhấn nút "Run workflow" để build APK.<br>'+
        'Khi build xong (~5-10 phút), vào tab Artifacts để tải APK.';
    } else {
      status.className='error';status.textContent='❌ Lỗi: '+data.error;
    }
  }catch(e){status.className='error';status.textContent='❌ Lỗi kết nối: '+e.message}
  btn.disabled=false;btn.textContent='Đẩy Code lên GitHub';
}
</script>
</body>
</html>`);
  });

  app.post("/api/github-push", async (req, res) => {
    const { token, repo } = req.body;
    if (!token || !repo) {
      return res.json({ success: false, error: "Thiếu token hoặc tên repo" });
    }

    try {
      const user = await ghApi(token, '/user');
      if (user.message === 'Bad credentials') {
        return res.json({ success: false, error: "Token không hợp lệ. Kiểm tra lại token." });
      }
      const username = user.login;
      const repoFullName = `${username}/${repo}`;

      let repoInfo = await ghApi(token, `/repos/${repoFullName}`);
      
      if (repoInfo.message === 'Not Found') {
        console.log('GitHub Push: Repo not found, creating...');
        await ghApi(token, '/user/repos', { name: repo, private: false, auto_init: false });
        await new Promise(r => setTimeout(r, 2000));
      }

      let ref = await ghApi(token, `/repos/${repoFullName}/git/ref/heads/main`);
      let parentSha = ref?.object?.sha;

      if (!parentSha) {
        console.log('GitHub Push: Empty repo, creating initial commit via Contents API...');
        const initContent = Buffer.from('# ' + repo + '\n\nĐếm Ngày Yêu - Love Day Counter\n').toString('base64');
        const initResult = await ghApi(token, `/repos/${repoFullName}/contents/README.md`, {
          message: 'Initial commit',
          content: initContent
        }, 'PUT');
        console.log('GitHub Push: Init result:', JSON.stringify(initResult).slice(0, 300));
        
        if (initResult?.commit?.sha) {
          await new Promise(r => setTimeout(r, 2000));
          ref = await ghApi(token, `/repos/${repoFullName}/git/ref/heads/main`);
          parentSha = ref?.object?.sha;
        }
      }

      if (!parentSha) {
        return res.json({ success: false, error: "Không khởi tạo được repo. Vui lòng xóa repo '" + repo + "' trên GitHub.com, rồi quay lại thử lại." });
      }
      console.log(`GitHub Push: Parent SHA: ${parentSha}`);

      const srcDir = process.cwd();
      const files = getAllFiles(srcDir, '');
      console.log(`GitHub Push: Found ${files.length} files to upload`);

      const treeEntries: Array<{ path: string; mode: string; type: string; sha: string }> = [];

      for (let i = 0; i < files.length; i++) {
        const { full, rel } = files[i];
        const content = fs.readFileSync(full).toString('base64');
        const blob = await ghApi(token, `/repos/${repoFullName}/git/blobs`, { content, encoding: 'base64' });
        if (blob?.sha) {
          treeEntries.push({ path: rel, mode: '100644', type: 'blob', sha: blob.sha });
          console.log(`[${i + 1}/${files.length}] ${rel}`);
        } else {
          console.log(`FAIL [${i + 1}/${files.length}] ${rel}`);
        }
      }

      const tree = await ghApi(token, `/repos/${repoFullName}/git/trees`, { tree: treeEntries });
      if (!tree?.sha) {
        return res.json({ success: false, error: "Không tạo được tree: " + JSON.stringify(tree).slice(0, 200) });
      }

      const commitData: any = { message: 'Đếm Ngày Yêu - Love Day Counter app', tree: tree.sha };
      if (parentSha) commitData.parents = [parentSha];

      const commit = await ghApi(token, `/repos/${repoFullName}/git/commits`, commitData);
      if (!commit?.sha) {
        return res.json({ success: false, error: "Không tạo được commit" });
      }

      await ghApi(token, `/repos/${repoFullName}/git/refs/heads/main`, { sha: commit.sha, force: true }, 'PATCH');

      console.log(`GitHub Push: SUCCESS to ${repoFullName}`);
      return res.json({ success: true, repoFullName, filesCount: treeEntries.length });

    } catch (error: any) {
      console.error('GitHub Push error:', error);
      return res.json({ success: false, error: error.message || "Lỗi không xác định" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
