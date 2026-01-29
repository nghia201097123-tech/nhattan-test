# SEED MANAGEMENT SYSTEM - FRONTEND WEB

## Tong Quan

Frontend Web Application cho He thong Quan ly Giong Cay trong, xay dung bang Next.js + Ant Design Pro.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI Library:** Ant Design 5 + Ant Design Pro Components
- **State Management:** Zustand
- **Data Fetching:** TanStack React Query
- **Styling:** Tailwind CSS
- **Form:** Ant Design Form + React Hook Form
- **Charts:** @ant-design/charts
- **Icons:** @ant-design/icons
- **HTTP Client:** Axios

---

## Cau Truc Thu Muc

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth layout
│   │   ├── login/
│   │   └── forgot-password/
│   │
│   ├── (dashboard)/              # Dashboard layout
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard home
│   │   │
│   │   ├── catalog/              # Quan ly danh muc
│   │   │   ├── seed-categories/
│   │   │   ├── seed-varieties/
│   │   │   ├── locations/
│   │   │   ├── warehouses/
│   │   │   ├── storage-locations/
│   │   │   ├── staff/
│   │   │   ├── sample-providers/
│   │   │   ├── export-reasons/
│   │   │   ├── evaluation-stages/
│   │   │   ├── evaluation-criteria/
│   │   │   └── custom-categories/
│   │   │
│   │   ├── samples/              # Quan ly mau giong
│   │   │   ├── page.tsx          # Danh sach mau
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx      # Chi tiet mau
│   │   │   │   ├── edit/
│   │   │   │   ├── evaluations/
│   │   │   │   └── history/
│   │   │   ├── create/
│   │   │   └── seed-card/
│   │   │
│   │   ├── evaluations/          # Danh gia mau
│   │   │   ├── page.tsx
│   │   │   ├── pending/
│   │   │   └── [id]/
│   │   │
│   │   ├── propagation/          # Nhan mau
│   │   │   ├── batches/
│   │   │   └── [id]/
│   │   │
│   │   ├── warehouse/            # Quan ly kho
│   │   │   ├── receipts/         # Phieu nhap
│   │   │   ├── exports/          # Phieu xuat
│   │   │   ├── transfers/        # Chuyen kho
│   │   │   ├── inventory/        # Ton kho
│   │   │   └── stock-summary/    # Bao cao nhap-xuat-ton
│   │   │
│   │   ├── alerts/               # Canh bao
│   │   │   ├── page.tsx
│   │   │   └── config/
│   │   │
│   │   ├── reports/              # Bao cao
│   │   │   ├── advanced-search/
│   │   │   ├── annual/
│   │   │   └── saved-filters/
│   │   │
│   │   ├── users/                # Quan ly nguoi dung
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │
│   │   └── settings/             # Cai dat
│   │       ├── profile/
│   │       └── system/
│   │
│   ├── globals.css
│   └── layout.tsx
│
├── components/
│   ├── ui/                       # UI Components
│   │   ├── DataTable/
│   │   ├── TreeSelect/
│   │   ├── FileUpload/
│   │   ├── QRCodeDisplay/
│   │   ├── LocationPicker/
│   │   ├── DateRangePicker/
│   │   └── StatusBadge/
│   │
│   ├── forms/                    # Form Components
│   │   ├── SampleForm/
│   │   ├── EvaluationForm/
│   │   ├── ReceiptForm/
│   │   ├── ExportForm/
│   │   └── TransferForm/
│   │
│   ├── layouts/                  # Layout Components
│   │   ├── DashboardLayout/
│   │   ├── AuthLayout/
│   │   ├── Sidebar/
│   │   └── Header/
│   │
│   ├── charts/                   # Chart Components
│   │   ├── StockChart/
│   │   ├── CategoryPieChart/
│   │   └── TrendLineChart/
│   │
│   └── modals/                   # Modal Components
│       ├── SampleDetailModal/
│       ├── QRScannerModal/
│       ├── PrintPreviewModal/
│       └── ConfirmModal/
│
├── hooks/                        # Custom Hooks
│   ├── useAuth.ts
│   ├── useSamples.ts
│   ├── useWarehouses.ts
│   ├── useAlerts.ts
│   ├── usePagination.ts
│   ├── useDebounce.ts
│   └── useLocalStorage.ts
│
├── services/                     # API Services
│   ├── api.ts                    # Axios instance
│   ├── auth.service.ts
│   ├── samples.service.ts
│   ├── catalog.service.ts
│   ├── warehouse.service.ts
│   ├── alerts.service.ts
│   └── reports.service.ts
│
├── stores/                       # Zustand Stores
│   ├── auth.store.ts
│   ├── ui.store.ts
│   └── filter.store.ts
│
├── types/                        # TypeScript Types
│   ├── auth.types.ts
│   ├── sample.types.ts
│   ├── catalog.types.ts
│   ├── warehouse.types.ts
│   └── common.types.ts
│
├── utils/                        # Utilities
│   ├── constants.ts
│   ├── helpers.ts
│   ├── formatters.ts
│   └── validators.ts
│
└── lib/                          # Third-party configs
    ├── antd.ts
    ├── queryClient.ts
    └── axios.ts
```

---

## CAC TRANG CHINH

### 1. Dashboard (Trang chu)

**Route:** `/`

**Noi dung:**
- Thong ke tong quan (so mau, ton kho, canh bao)
- Bieu do phan bo mau theo loai giong
- Bieu do xu huong nhap/xuat kho
- Danh sach canh bao moi nhat
- Mau can danh gia sap toi
- Hoat dong gan day

---

### 2. Quan ly Danh muc (Catalog)

#### 2.1. Loai/Nhom giong (Seed Categories)
**Route:** `/catalog/seed-categories`

**Chuc nang:**
- Hien thi cay phan cap (Tree)
- Them/Sua/Xoa node
- Keo tha sap xep (Drag & Drop)
- Tim kiem trong cay

#### 2.2. Danh muc giong (Seed Varieties)
**Route:** `/catalog/seed-varieties`

**Chuc nang:**
- Bang danh sach voi filter, pagination
- Tim kiem theo ten, ma
- Loc theo loai giong
- Import/Export Excel
- CRUD operations

#### 2.3. Dia phuong (Locations)
**Route:** `/catalog/locations`

**Chuc nang:**
- Cay 3 cap: Tinh > Huyen > Xa
- Import du lieu dia gioi
- Cascader picker

#### 2.4. Kho luu giu (Warehouses)
**Route:** `/catalog/warehouses`

**Chuc nang:**
- Danh sach kho
- Thong tin nhiet do, do am
- Bieu do ty le su dung
- Quan ly vi tri (Tu/Ke/Ngan)

#### 2.5. Vi tri kho (Storage Locations)
**Route:** `/catalog/storage-locations`

**Chuc nang:**
- Cay 3 cap: Tu > Ke > Ngan
- Hien thi trang thai (trong/day)
- Quan ly suc chua

#### 2.6. Can bo (Staff)
**Route:** `/catalog/staff`

**Chuc nang:**
- Danh sach can bo
- Phan loai theo vai tro
- Lien ket voi tai khoan

#### 2.7. Noi cung cap (Sample Providers)
**Route:** `/catalog/sample-providers`

**Chuc nang:**
- Danh sach nha cung cap
- Phan loai (Ngan hang gen, Vien, To chuc, Ca nhan)

---

### 3. Quan ly Mau giong (Samples)

#### 3.1. Danh sach mau
**Route:** `/samples`

**Chuc nang:**
- Bang du lieu voi nhieu cot
- Bo loc nang cao (nhieu tieu chi)
- Tim kiem full-text
- Xuat Excel
- Quet QR de tim mau
- Luu/Tai bo loc

**Cac cot hien thi:**
- Ma mau
- Ten giong / Ten dia phuong
- Loai giong
- Ngay thu thap
- Dia diem thu thap
- So luong hien tai
- Trang thai
- Vi tri kho
- Ty le nay mam gan nhat
- Thao tac

#### 3.2. Tao phieu thu thap
**Route:** `/samples/create`

**Form bao gom:**
- Thong tin giong (chon tu danh muc hoac nhap moi)
- Thong tin thu thap (ngay, mua vu)
- Dia diem (chon tu cay dia phuong, nhap chi tiet, GPS)
- Nguon cung cap
- Nguoi thu thap
- So luong ban dau
- Dac diem hinh thai
- Ghi chu
- Upload anh/tai lieu

#### 3.3. Chi tiet mau
**Route:** `/samples/[id]`

**Noi dung:**
- Thong tin co ban
- Anh dinh kem (Gallery)
- Lich su danh gia (Timeline)
- Lich su bien dong kho (The kho)
- QR Code va The giong

**Tabs:**
- Thong tin chung
- Danh gia
- Lich su kho
- File dinh kem

#### 3.4. The giong (Seed Card)
**Route:** `/samples/[id]/seed-card`

**Chuc nang:**
- Preview the giong
- Xuat PDF
- In hang loat

---

### 4. Danh gia mau (Evaluations)

#### 4.1. Danh sach danh gia
**Route:** `/evaluations`

**Chuc nang:**
- Danh sach cac lan danh gia
- Loc theo giai doan, ket qua
- Xem chi tiet

#### 4.2. Mau can danh gia
**Route:** `/evaluations/pending`

**Chuc nang:**
- Danh sach mau den han danh gia
- Nhom theo giai doan
- Tao danh gia nhanh

#### 4.3. Form danh gia
**Route:** `/evaluations/create` hoac Modal

**Form bao gom:**
- Chon mau giong
- Chon giai doan danh gia
- Ngay danh gia
- Nguoi danh gia
- Cac tieu chi (dynamic theo giai doan)
- Ket luan
- De xuat
- Upload anh

---

### 5. Nhan mau (Propagation)

#### 5.1. Danh sach dot nhan
**Route:** `/propagation/batches`

**Chuc nang:**
- Danh sach cac dot nhan
- Trang thai (Ke hoach, Dang gieo, Thu hoach, Hoan thanh)
- Thong ke so mau

#### 5.2. Chi tiet dot nhan
**Route:** `/propagation/batches/[id]`

**Noi dung:**
- Thong tin dot nhan
- Danh sach mau trong dot
- Cap nhat trang thai tung mau
- Nhap ket qua thu hoach

---

### 6. Quan ly Kho (Warehouse)

#### 6.1. Phieu nhap kho (Receipts)
**Route:** `/warehouse/receipts`

**Chuc nang:**
- Danh sach phieu nhap
- Tao phieu nhap moi
- Xac nhan nhap kho
- In phieu nhap
- In nhan QR

**Form tao phieu:**
- Chon kho
- Ngay nhap
- Nguon (Thu thap, Nhan, Chuyen kho, Khac)
- Them mau (quet QR hoac chon tu danh sach)
- Chon vi tri cho tung mau

#### 6.2. Phieu xuat kho (Exports)
**Route:** `/warehouse/exports`

**Chuc nang:**
- Danh sach phieu xuat (theo trang thai)
- Tao phieu xuat
- Gui duyet
- Duyet/Tu choi (cho Manager)
- Hoan tat xuat kho
- In phieu xuat

**Workflow:**
```
DRAFT -> PENDING_APPROVAL -> APPROVED -> EXPORTED
                          -> REJECTED -> DRAFT
```

#### 6.3. Chuyen kho (Transfers)
**Route:** `/warehouse/transfers`

**Chuc nang:**
- Danh sach phieu chuyen
- Tao phieu chuyen
- Xac nhan chuyen
- In nhan vi tri moi

#### 6.4. Ton kho (Inventory)
**Route:** `/warehouse/inventory`

**Chuc nang:**
- Danh sach ton kho theo kho
- Loc theo loai giong, vi tri
- Xem the kho cua tung mau

#### 6.5. Bao cao Nhap-Xuat-Ton
**Route:** `/warehouse/stock-summary`

**Chuc nang:**
- Chon ky (ngay/thang/quy/nam)
- Loc theo loai giong, kho
- Bang thong ke: Ton dau ky, Nhap, Xuat, Ton cuoi ky
- Bieu do
- Xuat Excel

---

### 7. Canh bao (Alerts)

#### 7.1. Danh sach canh bao
**Route:** `/alerts`

**Chuc nang:**
- Danh sach canh bao (moi nhat truoc)
- Loc theo loai, muc do
- Danh dau da doc
- Danh dau da xu ly
- Xem chi tiet mau lien quan

**Loai canh bao:**
- Qua han kiem tra
- Gan het han bao quan
- Nay mam thap
- Ton kho thap

#### 7.2. Cau hinh canh bao
**Route:** `/alerts/config`

**Chuc nang:**
- Bat/tat tung loai canh bao
- Thiet lap nguong
- Cau hinh gui email

---

### 8. Bao cao (Reports)

#### 8.1. Tra cuu nang cao
**Route:** `/reports/advanced-search`

**Chuc nang:**
- Xay dung dieu kien loc (Query Builder)
- Chon cot hien thi
- Luu bo loc
- Tai bo loc da luu
- Xuat ket qua

**Cac truong loc:**
- Ma mau, Ten giong, Ten dia phuong
- Loai giong (tree)
- Tinh/Huyen/Xa
- Nguon cung cap
- Nguoi thu thap
- Ngay thu thap (khoang)
- Trang thai
- Kho, Vi tri
- Ty le nay mam (khoang)
- Ngay nhap kho (khoang)

#### 8.2. Bao cao theo nam
**Route:** `/reports/annual`

**Noi dung:**
- Tong quan: Ton dau nam, Nhan duoc, Xuat, Nhan moi, Ton cuoi nam
- Chi tiet theo loai giong
- So sanh qua cac nam
- Danh sach nay mam kem
- Hoat dong nhan mau
- Xuat Excel (nhieu sheet)
- In bao cao

---

### 9. Quan ly Nguoi dung (Users)

**Route:** `/users`

**Chuc nang:**
- Danh sach nguoi dung
- Tao/Sua/Xoa
- Gan vai tro (Roles)
- Bat/tat tai khoan

---

### 10. Cai dat (Settings)

#### 10.1. Thong tin ca nhan
**Route:** `/settings/profile`

**Chuc nang:**
- Cap nhat thong tin
- Doi mat khau
- Upload avatar

#### 10.2. Cai dat he thong (Admin)
**Route:** `/settings/system`

**Chuc nang:**
- Cau hinh chung
- Quan ly vai tro va quyen

---

## COMPONENTS CHINH

### 1. DataTable
```tsx
<DataTable
  columns={columns}
  dataSource={data}
  loading={isLoading}
  pagination={pagination}
  rowSelection={rowSelection}
  onFilter={handleFilter}
  onSort={handleSort}
  exportable
  printable
/>
```

### 2. TreeSelect (Cay phan cap)
```tsx
<TreeSelect
  data={categories}
  value={selectedId}
  onChange={handleChange}
  showSearch
  allowClear
  placeholder="Chon loai giong"
/>
```

### 3. LocationPicker (Chon dia diem)
```tsx
<LocationPicker
  value={locationId}
  onChange={handleChange}
  showDetail    // Hien thi input chi tiet
  showGPS       // Hien thi input GPS
/>
```

### 4. FileUpload
```tsx
<FileUpload
  accept="image/*,.pdf,.doc,.docx"
  multiple
  maxCount={5}
  maxSize={10 * 1024 * 1024}
  value={files}
  onChange={handleChange}
  onPreview={handlePreview}
/>
```

### 5. QRCodeDisplay
```tsx
<QRCodeDisplay
  value={sampleCode}
  size={200}
  downloadable
  printable
/>
```

### 6. StatusBadge
```tsx
<StatusBadge
  status="IN_STORAGE"
  type="sample"
/>
```

### 7. AdvancedFilter (Bo loc nang cao)
```tsx
<AdvancedFilter
  fields={filterFields}
  value={conditions}
  onChange={handleChange}
  onSave={handleSave}
  savedFilters={savedFilters}
/>
```

---

## STATE MANAGEMENT

### Auth Store (Zustand)
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}
```

### UI Store
```typescript
interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}
```

### Filter Store
```typescript
interface FilterState {
  savedFilters: SavedFilter[];
  currentFilter: FilterCondition[];
  loadFilters: () => Promise<void>;
  saveFilter: (filter: SavedFilter) => Promise<void>;
  applyFilter: (conditions: FilterCondition[]) => void;
}
```

---

## API SERVICES

### Sample Service
```typescript
const sampleService = {
  getAll: (params: SampleFilterDto) => api.get('/samples', { params }),
  getById: (id: string) => api.get(`/samples/${id}`),
  create: (data: CreateSampleDto) => api.post('/samples', data),
  update: (id: string, data: UpdateSampleDto) => api.put(`/samples/${id}`, data),
  delete: (id: string) => api.delete(`/samples/${id}`),
  generateCode: () => api.get('/samples/generate-code'),
  getQRCode: (id: string) => api.get(`/samples/${id}/qrcode`),
  getSeedCard: (id: string) => api.get(`/samples/${id}/seed-card`),
};
```

---

## REACT QUERY HOOKS

### useSamples
```typescript
export function useSamples(params: SampleFilterDto) {
  return useQuery({
    queryKey: ['samples', params],
    queryFn: () => sampleService.getAll(params),
  });
}

export function useSample(id: string) {
  return useQuery({
    queryKey: ['sample', id],
    queryFn: () => sampleService.getById(id),
    enabled: !!id,
  });
}

export function useCreateSample() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sampleService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['samples'] });
    },
  });
}
```

---

## RESPONSIVE DESIGN

### Breakpoints
```css
/* Mobile: < 576px */
/* Tablet: 576px - 992px */
/* Desktop: > 992px */
```

### Layout Behavior
- **Mobile:** Sidebar an, menu hamburger
- **Tablet:** Sidebar collapsed
- **Desktop:** Sidebar expanded

### Table Behavior
- **Mobile:** Card view hoac horizontal scroll
- **Tablet/Desktop:** Table view day du

---

## THEME CONFIGURATION

### Ant Design Theme
```typescript
const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
    fontFamily: 'Inter, sans-serif',
  },
  components: {
    Table: {
      headerBg: '#fafafa',
    },
    Menu: {
      itemSelectedBg: '#e6f7ff',
    },
  },
};
```

---

## BIEN MOI TRUONG (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=Seed Management System
NEXT_PUBLIC_UPLOAD_MAX_SIZE=10485760
```

---

## HUONG DAN CAI DAT

```bash
# Cai dat dependencies
npm install

# Chay development
npm run dev

# Build production
npm run build
npm run start

# Lint
npm run lint
npm run lint:fix

# Format
npm run format
```

---

## LUU Y PHAT TRIEN

1. **Authentication:** Su dung JWT token luu trong cookie (httpOnly)
2. **Error Handling:** Hien thi thong bao loi ro rang
3. **Loading States:** Skeleton loading cho UX tot
4. **Form Validation:** Validate ca client va server
5. **Accessibility:** Ho tro keyboard navigation
6. **Performance:** Lazy loading, code splitting
7. **Caching:** React Query cache strategy

---

*Version: 1.0 | Cap nhat: 01/2026*
