#!/usr/bin/env python3
"""Gắn lớp nâng cấp Audit RBA v1.8.0 (chọn nhanh hạng mục BH101→CM403, đa hạng mục, xóa nhanh,
bố cục Excel 220x165 tối đa 3 ảnh/dòng in vừa 1 trang A4 ngang, PDF mỗi trang 1 ảnh theo hạng mục).
Chạy SAU patch_pwa.py, patch_cloud.py và patch_ai.py:  python3 patch_rba.py <index.html>"""
import pathlib, sys

here = pathlib.Path(__file__).resolve().parent
f = pathlib.Path(sys.argv[1])
s = f.read_text(encoding='utf-8')


def rep(a: str, b: str, n: int = 1) -> None:
    global s
    c = s.count(a)
    assert c == n, f'cần {n} chỗ, thấy {c}: {a[:70]!r}'
    s = s.replace(a, b)


assert 'window.__RBA18' not in s, 'Đã chạy patch_rba.py trên file này rồi'
js = (here / 'rba.js').read_text(encoding='utf-8')
css = (here / 'rba.css').read_text(encoding='utf-8')

# Nút × xóa ảnh ngay trên khung xem ảnh (#stage) + hộp nhắc chọn mã ở màn Báo cáo
rep('<button class="stage-full" id="btnStageFull"',
    '<button class="stage-del" id="btnStageDel" type="button" title="Xóa ảnh này (nếu chọn nhầm ảnh)" hidden>×</button>\n        <button class="stage-full" id="btnStageFull"')

rep('<p class="xready" id="xReady"></p>',
    '<div id="rbaAltBox" hidden></div>\n          <p class="xready" id="xReady"></p>')

i = s.rindex('</style>')
s = s[:i] + css + '\n' + s[i:]
rep('/* ---------- Khởi động ---------- */', js + '\n/* ---------- Khởi động ---------- */')
f.write_text(s, encoding='utf-8')
print('OK', f)
