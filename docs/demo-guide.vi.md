# Huong Dan Demo Angular + Figma MCP (Tieng Viet)

## 1. Muc Tieu Demo
Chung minh voi khach hang rang UI Angular duoc doi chieu voi ky vong tu Figma, khong chi la test giao dien co ban.

## 2. Cai Dat Mot Lan
1. Mo terminal tai thu muc `figma-mcp-poc`.
2. Cai dependency:

```bash
npm install
```

## 3. Chay Demo Day Du
Chay toan bo QA va tao bao cao de trinh bay voi khach hang:

```bash
npm run qa:demo:customer
```

Lenh nay thuc hien 2 viec:
1. Chay tat ca test Playwright (semantic, visual baseline, Figma contract).
2. Tao trang tong hop danh cho stakeholder.

## 4. Mo Bao Cao
### A. Bao Cao Chi Tiet Playwright HTML
```bash
npm run qa:report:open
```
Neu may khong mo duoc browser tu lenh tren, mo truc tiep file:
- `playwright-report/index.html`

### B. Bao Cao Tong Hop Cho Khach Hang (Don Gian)
Mo truc tiep file:
- `demo-report/index.html`

## 5. Can Trinh Bay Gi Cho Khach Hang
Nen mo `demo-report/index.html` truoc, sau do neu can thi mo bao cao Playwright chi tiet.

### Cac diem chung minh chinh
1. Trang thai tong: PASS/FAIL.
2. Danh sach test da chay.
3. Bang `Figma Expected vs Actual`:
   - Gia tri text (title, label, button text, helper text)
   - Token style (mau sac, border radius, card width)
4. Anh chup doi chieu duoc dinh kem trong test Figma.

## 6. Giai Thich 3 Lop Test
1. Semantic QA: kiem tra thanh phan va noi dung text bat buoc.
2. Visual baseline QA: kiem tra tinh on dinh screenshot.
3. Figma contract QA: doi chieu gia tri render Angular voi gia tri ky vong lay tu Figma.

## 7. Loi Thoai Demo De Xuat (2-3 phut)
1. Mo trang Angular local.
2. Chay `npm run qa:demo:customer`.
3. Mo `demo-report/index.html`, trinh bay PASS va bang expected vs actual.
4. Mo `playwright-report/index.html`, cho thay file JSON + screenshot dinh kem trong test Figma.

## 8. Xu Ly Su Co
1. Neu test fail, doc dong mismatch trong bao cao tong hop.
2. Neu giao dien thay doi co chu dich va visual test fail, cap nhat baseline:

```bash
npm run qa:test:update-snapshots
```

3. Chay lai demo day du:

```bash
npm run qa:demo:customer
```
