#!/usr/bin/env python3
"""Đóng gói tự động một lệnh duy nhất cho Audit RBA (v1.6.5+).

Cách dùng:
    python3 build.py 1.6.5
    python3 build.py 1.6.5 https://audit-rba-api.likiop00.workers.dev
"""
import json
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "source"
DOCS = ROOT / "docs"
TOOLS = SRC / "3-cong-cu-dung"
DEFAULT_API = "https://audit-rba-api.likiop00.workers.dev"


def current_version() -> str:
    sw = DOCS / "sw.js"
    if sw.exists():
        m = re.search(r"const V='audit-rba-([^']+)'", sw.read_text(encoding="utf-8"))
        if m:
            return m.group(1)
    return "1.6.5"


def run_py(*args: str) -> None:
    subprocess.run([sys.executable, *args], check=True)


def check_js_syntax(js_code: str, label: str, module: bool = False) -> None:
    suffix = ".mjs" if module else ".js"
    with tempfile.NamedTemporaryFile("w", suffix=suffix, encoding="utf-8", delete=False) as tf:
        tf.write(js_code)
        tmp_path = pathlib.Path(tf.name)
    try:
        subprocess.run(["node", "--check", str(tmp_path)], check=True)
        print(f"✓ Cú pháp JS hợp lệ: {label}")
    finally:
        tmp_path.unlink(missing_ok=True)


def fallback_pwa_assets(out_dir: pathlib.Path, ver: str) -> None:
    """Tạo sw.js, manifest.webmanifest và giữ nguyên bộ icon từ docs/ nếu máy chưa cài Pillow."""
    for ic in ("icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png"):
        src_ic = DOCS / ic
        if not src_ic.exists():
            src_ic = SRC / "2-ban-cai-web" / ic
        shutil.copy2(src_ic, out_dir / ic)

    bg_hex = "#14191C"
    old_mf = DOCS / "manifest.webmanifest"
    if old_mf.exists():
        try:
            bg_hex = json.loads(old_mf.read_text(encoding="utf-8")).get("background_color", bg_hex)
        except Exception:
            pass

    manifest = {
        "name": "Audit RBA",
        "short_name": "Audit RBA",
        "lang": "vi",
        "description": "Soát ảnh hiện trường EHS theo RBA Guider, khoanh lỗi và xuất file Findings.",
        "start_url": "./",
        "scope": "./",
        "id": "./",
        "display": "standalone",
        "orientation": "any",
        "background_color": bg_hex,
        "theme_color": "#14191C",
        "icons": [
            {"src": "icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "icon-512.png", "sizes": "512x512", "type": "image/png"},
            {"src": "icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }
    (out_dir / "manifest.webmanifest").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8"
    )
    sw_code = f"""// Audit RBA: chạy khi mất mạng. Trang chính lấy bản mới khi có mạng, mất mạng thì dùng bản đã lưu.
const V='audit-rba-{ver}';
const SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
const CDN=['https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'];
self.addEventListener('install',e=>{{e.waitUntil((async()=>{{const c=await caches.open(V);await c.addAll(SHELL);
  for(const u of CDN){{try{{await c.put(u,await fetch(u,{{mode:'no-cors'}}))}}catch{{}}}}
  self.skipWaiting()}})())}});
self.addEventListener('activate',e=>{{e.waitUntil((async()=>{{for(const k of await caches.keys())if(k!==V)await caches.delete(k);await self.clients.claim()}})())}});
self.addEventListener('fetch',e=>{{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.hostname==='api.anthropic.com')return;
  if(r.mode==='navigate'){{e.respondWith((async()=>{{const c=await caches.open(V);
    try{{const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),5000);const n=await fetch(r,{{signal:ctl.signal}});clearTimeout(t);if(n.ok)c.put('index.html',n.clone());return n}}
    catch{{return (await c.match('index.html'))||(await c.match('./'))||Response.error()}}}})());return}}
  const keep=u.origin===location.origin||/(^|\\.)(cdnjs\\.cloudflare\\.com|fonts\\.googleapis\\.com|fonts\\.gstatic\\.com)$/.test(u.hostname);
  if(!keep)return;
  e.respondWith((async()=>{{const c=await caches.open(V),hit=await c.match(r);
    const net=fetch(r).then(n=>{{if(n&&(n.ok||n.type==='opaque'))c.put(r,n.clone());return n}}).catch(()=>null);
    return hit||(await net)||Response.error()}})());
}});
"""
    (out_dir / "sw.js").write_text(sw_code, encoding="utf-8")


def main() -> None:
    ver = sys.argv[1] if len(sys.argv) > 1 else current_version()
    api = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_API
    print(f"=== Đóng gói Audit RBA v{ver} (API: {api}) ===")

    with tempfile.TemporaryDirectory() as td:
        out = pathlib.Path(td)
        base_html = SRC / "1-ma-nguon-app" / "soat-anh-ehs-rba.html"
        idx = out / "index.html"

        run_py(str(TOOLS / "patch_pwa.py"), str(base_html), str(idx), ver)
        try:
            run_py(str(TOOLS / "pwa_assets.py"), str(out), ver, str(TOOLS / "logo.webp"))
        except subprocess.CalledProcessError:
            print("ℹ Chưa cài Pillow, sử dụng bộ icon PNG chuẩn có sẵn.")
            fallback_pwa_assets(out, ver)

        shutil.copy2(TOOLS / "_headers", out / "_headers")
        run_py(str(TOOLS / "patch_cloud.py"), str(idx), api)
        run_py(str(TOOLS / "patch_ai.py"), str(idx))
        run_py(str(TOOLS / "rba" / "patch_rba.py"), str(idx))
        (out / ".nojekyll").touch()

        # Kiểm tra cú pháp toàn bộ mã JS sinh ra và mã máy chủ trước khi ghi đè vào docs/
        html_text = idx.read_text(encoding="utf-8")
        inline_scripts = re.findall(r"<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>", html_text, flags=re.S)
        for i, sc in enumerate(inline_scripts, 1):
            check_js_syntax(sc, f"docs/index.html <script #{i}>")
        check_js_syntax((out / "sw.js").read_text(encoding="utf-8"), "docs/sw.js")
        srv_js = ROOT / "server" / "src" / "index.js"
        if srv_js.exists():
            check_js_syntax(srv_js.read_text(encoding="utf-8"), "server/src/index.js", module=True)

        DOCS.mkdir(parents=True, exist_ok=True)
        for item in DOCS.iterdir():
            if item.is_dir():
                shutil.rmtree(item)
            else:
                item.unlink()
        for item in out.iterdir():
            shutil.copy2(item, DOCS / item.name)

    print(f"✓ Đã xuất bản thành công sang {DOCS} (v{ver})")


if __name__ == "__main__":
    main()
