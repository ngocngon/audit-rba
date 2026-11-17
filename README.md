# Audit RBA

App soát ảnh hiện trường EHS theo RBA Guider 8.0.1: AI khoanh vùng và viết lỗi, người đánh giá xác nhận, xuất file Findings mẫu SEV/T, ảnh báo cáo song ngữ, PDF trình chiếu. Có lưu dữ liệu online theo phân vùng, đăng nhập và phân quyền 3 cấp.

- **Link dùng app (24/24):** https://audit-rba.pages.dev (link dự phòng: https://ngocngon.github.io/audit-rba/)
- **Máy chủ API (Cloudflare Workers + D1):** `https://audit-rba-api.likiop00.workers.dev`

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `docs/` | Bản cài web (PWA) đang chạy trên GitHub Pages |
| `server/` | Máy chủ Cloudflare Workers + cơ sở dữ liệu D1 (`schema.sql`, `src/index.js`, `wrangler.toml`) |
| `source/` | Gói mã nguồn gốc v1.1 + lớp online (`3-cong-cu-dung/cloud/`, `patch_cloud.py`) + lớp nâng cao AI (`3-cong-cu-dung/ai/`, `patch_ai.py`) |

## Phân vùng và quyền

- **Phân vùng trong Kho audit:** Đối tác (Vendor) → Lần audit (ngày) → Khu vực → Ảnh và lỗi.
- **Ba vai trò** (máy chủ kiểm tra ở mọi thao tác):
  - **Quản trị viên (Admin):** quản lý người dùng, giao audit, khóa audit, cài đặt hệ thống, nhật ký, sửa và xóa mọi audit.
  - **Auditor:** tạo audit mới; chỉ sửa audit do mình tạo hoặc được Admin giao.
  - **Người xem:** chỉ xem và tải báo cáo, không sửa được dữ liệu online.
- Mất mạng vẫn dùng trên máy như bình thường; có mạng tự đồng bộ lên Kho audit.

## Nâng cao độ chính xác AI (v1.4)

- Danh sách kiểm tra theo khu vực (13 loại khu vực), quy tắc chọn mã RBA và mốc mức độ Priority/Major/Minor đưa vào lời nhắc.
- Mẫu khắc phục theo thứ bậc biện pháp kiểm soát, kèm bộ phận phụ trách và hạn theo mức độ (Priority: trong ca, Major: 7 ngày, Minor: 30 ngày).
- Học từ lỗi cả đội đã xác nhận trên máy chủ (`/api/ai/examples`), ưu tiên cùng khu vực, cùng đối tác.
- AI tự kiểm tra lại: phóng to từng lỗi, giữ/sửa/loại, bổ sung lỗi bỏ sót rõ ràng (thêm 1 lượt gọi mỗi ảnh, không áp dụng chế độ Nhanh).
- Kết quả ổn định (temperature thấp, seed cố định cho Gemini 1.x/2.x), ảnh độ phân giải cao.
- Tab **Quản trị → Độ chính xác AI**: thống kê giữ/sửa/loại/bỏ sót theo mã, theo model.
- Bật tắt: Cài đặt hệ thống → AI soát ảnh → Nâng cao độ chính xác.

## Kiểm soát chất lượng kết quả (v1.5, `ai/ai-quality.js`)

- **Bảng quy tắc mã và mức độ:** nội dung lỗi khớp từ khóa của một loại lỗi trong danh mục mà AI chọn sai nhóm (hoặc để KHAC) thì app tự sửa id, mã RBA, ID yêu cầu, mức độ theo danh mục; lỗi được gắn nhãn "Đã chỉnh mã theo bảng quy tắc".
- **AI chỉ ra vật thể trước:** AI liệt kê vật thể nhìn thấy kèm khung, mỗi lỗi phải gắn vật thể; lỗi không gắn được bị loại (ghi vào mục cần kiểm tra thêm); khung lỗi bám sát vật thể.
- **Loại ảnh trùng khi tải lên:** giống hệt thì tự bỏ qua; gần giống thì hỏi giữ hay bỏ (có ảnh so sánh).
- **Gom lỗi lặp lại:** cùng loại lỗi ở nhiều ảnh gom thành nhóm ở màn Xác nhận lỗi; xác nhận cả nhóm, thống nhất mã và mức độ, chọn ảnh đại diện, tách lỗi khỏi nhóm. Khi xuất Findings, mỗi nhóm là 1 dòng (ghi số vị trí, khu vực) với ảnh đại diện.
- Bật tắt: Cài đặt hệ thống → AI soát ảnh → Kiểm soát chất lượng kết quả.

## Bổ sung dữ liệu kiểm tra (v1.6, `ai/ai-data.js`)

- **Tủ điện:** danh sách kiểm tra chi tiết luôn gửi kèm lời nhắc (đầu cos, ống lồng số dây, tấm cover, gỉ sét, ốc lỏng, nhãn aptomat, màu dây vàng-xanh, tiếp địa cửa tủ, khóa, biển cảnh báo, sơ đồ một sợi). Lỗi mới D14–D21.
- **Bảng tên người phụ trách:** tủ điện (D14), tủ máy, tủ thiết bị, kho, cửa kho bãi (NT1), thiết bị môi trường (V1).
- **Bảng tin:** kết quả quan trắc môi trường lao động (BT1, BT2 — Luật 84/2015/QH13 Điều 18 khoản 2, khoản 4 điểm a), thông tin an toàn bắt buộc (BT3), kênh phản ánh (BT4), tài liệu hết hiệu lực, rách, mờ (BT5), chính sách EHS (BT6); các tài liệu lao động chỉ nhắc kiểm tra.
- Bảng quy tắc từ khóa có thêm các lỗi mới; D7, D9, D12 tinh chỉnh từ khóa.
- **v1.6.1 — kiểm tra theo loại ảnh** (luôn gửi kèm lời nhắc):
  - Trần nhà: ẩm mốc, thấm dột, rò rỉ nước (TR1), trần sụt vỡ (TR2), thiếu đầu báo cháy (F14), kho hóa chất/cồn dùng thiết bị điện không phòng nổ (F15).
  - Cửa, lối ra vào: đèn EXIT (F5), chiều mở cửa (F3), vật cản, khóa cửa (F1, F2).
  - Bình chữa cháy: chưa kiểm định, không có checklist (TN2), phiếu không cập nhật (F13), vòi, loa phun, gioăng cao su hỏng (TN3), che chắn (F8), thiếu layout PCCC, tiêu lệnh (F16).
  - Hóa chất: nhãn GHS, hình đồ cảnh báo (H2), biển cảnh báo bể, bồn, kho (H9), khay chống tràn (H1), để sai khu vực lưu trữ (H8).

## Nhóm lỗi, gợi ý vấn đề, tra cứu hóa chất (v1.6.2, `ai/ai-group.js`)

- **1 lỗi nhiều ảnh = 1 dòng khi xuất:** mỗi nhóm chọn "Ảnh ghép" (tối đa 4 ảnh, có khung lỗi và chú thích) hoặc "Ảnh đại diện". Áp dụng thống nhất cho Findings, PDF, ảnh báo cáo, zip. Mặc định chỉnh trong Cài đặt.
- **Sửa nhóm, thêm vấn đề:** đổi mã lỗi, tiêu đề chung, mức độ, bằng chứng, biện pháp; tích gợi ý liên quan, "AI soát lại nhóm" hoặc tự gõ (mỗi dòng 1 vấn đề) → tạo lỗi riêng hoặc gộp vào tiêu đề nhóm.
- **"Vấn đề có thể có" khi mở ảnh:** tích chọn để thêm lỗi (AI nghi ngờ, mục cần xác minh, gợi ý theo loại ảnh); bỏ tích để xóa.
- **Hóa chất:** bảng phân loại cần/không cần khay chống tràn, cần tủ thông gió/hút mùi; lỗi mới H10 (hóa chất dễ bay hơi không thông gió, hút mùi); ô "Tra cứu" trong thẻ lỗi H1/H2/H3/H5/H8/H9/H10/V5.

## Song ngữ cho mọi file xuất (v1.6.3, `ai/ai-lang.js`)

- Findings, ảnh báo cáo, ảnh ghép nhóm lỗi, PDF và file đối chiếu Guider dùng chung cặp ngôn ngữ chọn trong Cài đặt (Việt – Hàn / Việt – Trung / Việt – Anh).
- Findings: khu vực, phát hiện, biện pháp ghi bản dịch ở trên, tiếng Việt ở dưới; cột thời hạn khắc phục để trống.
- File đối chiếu Guider: phát hiện và hành động khắc phục ghi "tiếng Việt / bản dịch".

## Báo lỗi key Gemini rõ nguyên nhân (v1.6.4, `ai/ai-key.js`)

- Lỗi 403 hiện đúng nguyên nhân Google báo và cách sửa: key bị lộ, giới hạn trang web, giới hạn API, chưa bật Generative Language API, vị trí mạng (VPN), thanh toán.
- Nếu chỉ một mô hình bị chặn, app tự thử mô hình Gemini khác và nhớ mô hình dùng được.

## Tối ưu lưu trữ R2, tìm kiếm & bảo mật (v1.6.5)

- **Cloudflare R2 + tự động chuyển ảnh cũ:** bật lưu trữ ảnh hiện trường trên R2 (`audit-rba-images`, gỡ bỏ giới hạn 500 MB của D1), tự động đọc và di chuyển ngầm ảnh cũ từ bảng `imgs` (D1) sang R2 mà không làm gián đoạn người dùng; tự dọn sạch ảnh khi xóa audit.
- **Tách `thumb` và chỉ mục `search_text` trên D1:** loại bỏ chuỗi Base64 ra khỏi dữ liệu JSON chính giúp `/api/search` không khớp nhầm ký tự Base64 và giảm ~90% băng thông đọc dòng ở `/api/ai/examples`.
- **Bảo mật phiên & đăng nhập:** khóa dò mật khẩu tách biệt theo `(email, IP)` để chống khóa cứng tài khoản quản trị viên; cưỡng chế đổi mật khẩu tạm (`must_change`) ngay ở tầng API máy chủ và khi tải lại trang.
- **AI Gemini (`ai/ai-key.js`, `ai/ai-group.js`):** ghi đúng tên mô hình dự phòng vào nhật ký và thống kê độ chính xác AI; không ghi đè mô hình chính khi chỉ mô hình chế độ Kỹ bị giới hạn; nâng giới hạn ảnh gửi "AI soát lại nhóm" lên đủ 4 vị trí.
- **Đóng gói 1 lệnh (`build.py`):** tự động dựng PWA, kiểm tra cú pháp toàn bộ mã JS bằng `node --check` trước khi xuất ra `docs/`.

## Tối ưu đánh giá lại, tự học & báo cáo chuẩn 4:3 (v1.6.6 → v1.8.0)

- **Xác nhận lỗi nhanh & trực quan (`rba/rba.js`):**
  - Cột **Hạng mục (bấm để đổi)** ngay trên từng dòng lỗi (cả máy tính và điện thoại) giúp đổi nhanh mã hạng mục RBA (`BH101` → `CM403` hoặc `EH000 · Lỗi EHS khác`) nếu AI phán định chưa chuẩn.
  - Nút **`🗑 Xóa`** (bấm 2 lần an toàn; tự ghi vào Sổ tự học nếu loại đề xuất sai của AI) và nút **`⚠ Chọn mã`** khi một ảnh liên quan nhiều hạng mục RBA.
  - Nút **`×`** xóa nhanh ảnh chọn nhầm ngay trên hình thu nhỏ ở bảng Xác nhận lỗi, dải ảnh bên trái và khung xem ảnh.
  - Mọi danh sách trong ứng dụng tự động sắp xếp chuẩn theo thứ tự hạng mục từ **`BH101` đến `CM403`**, tiếp theo là **Lỗi EHS khác (`EH000`)** và cuối cùng là **ảnh chưa soát**.
- **Chuẩn hóa ảnh & bố cục Excel (`Findings.xlsm` & `Doi-chieu-Guider.xlsx`):**
  - Giữ cố định mẫu checklist, hạng mục, điểm và toàn bộ công thức.
  - Thiết lập in vừa **1 trang ngang khổ A4** (`fitToWidth=1, fitToHeight=0`).
  - Mọi ảnh cùng kích thước **`220 × 165` px**, phủ kín khung `4:3` (không viền tối, không nền mờ), căn giữa trong ô hình ảnh, **tối đa 3 ảnh một dòng**, tối đa **8 ảnh/ô** (ảnh cuối ghi `+n` nếu còn nhiều hơn).
  - Toàn bộ các hàng hạng mục đồng đều chiều cao **`150 pt`**; chỉ tự động tăng chiều cao khi chữ đã thu nhỏ hết cỡ vẫn dài hoặc có nhiều dòng ảnh.
- **PDF trình chiếu (`exportPdf`):**
  - Sắp xếp trang ảnh đúng thứ tự hạng mục từ **`BH101` trở đi** (cuối cùng là `Lỗi EHS khác`).
  - **Mỗi trang là một ảnh của một hạng mục, không gộp**, ảnh phủ kín khung `4:3` sắc nét.

## Phát hành bản mới

```bash
python3 build.py 1.8.0
git add -A && git commit -m "v1.8.0" && git push
```

Triển khai máy chủ `server/` (Cloudflare Workers + D1 + R2):
```bash
cd server
npx wrangler r2 bucket create audit-rba-images   # chạy 1 lần đầu khi bật R2
npx wrangler d1 execute audit-rba --remote --file schema.sql
npx wrangler deploy
```

Nhớ tăng số phiên bản mỗi lần phát hành để điện thoại lấy bản mới.
