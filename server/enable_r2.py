#!/usr/bin/env python3
"""Tự động tạo bucket R2 `audit-rba-images`, bật cấu hình trong wrangler.toml và deploy Worker.
Chạy sau khi đã nhấn Enable R2 trên Cloudflare Dashboard:
    python3 server/enable_r2.py
"""
import pathlib
import subprocess

HERE = pathlib.Path(__file__).resolve().parent
TOML = HERE / "wrangler.toml"

print("1. Tạo bucket R2 'audit-rba-images'...")
res = subprocess.run(
    ["npx", "wrangler", "r2", "bucket", "create", "audit-rba-images"],
    cwd=HERE,
    capture_output=True,
    text=True,
)
if res.returncode != 0 and "already exists" not in (res.stdout + res.stderr).lower():
    print(res.stdout, res.stderr)
    raise SystemExit("Chưa tạo được bucket R2. Hãy bấm Enable R2 trên Cloudflare Dashboard trước.")
print("✓ Bucket 'audit-rba-images' đã sẵn sàng.")

s = TOML.read_text(encoding="utf-8")
s = s.replace("# [[r2_buckets]]\n# binding = \"IMG\"\n# bucket_name = \"audit-rba-images\"",
              "[[r2_buckets]]\nbinding = \"IMG\"\nbucket_name = \"audit-rba-images\"")
TOML.write_text(s, encoding="utf-8")
print("2. Đã bật binding IMG trong server/wrangler.toml.")

print("3. Đang triển khai lại Worker...")
subprocess.run(["npx", "wrangler", "deploy"], cwd=HERE, check=True)
print("✓ Hoàn tất kích hoạt Cloudflare R2! Vào Quản trị -> Cài đặt hệ thống -> Tối ưu lưu trữ để chuyển ảnh cũ từ D1 sang R2.")
