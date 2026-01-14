# SEED MANAGEMENT SYSTEM - BACKEND API

## Tong Quan

Backend API cho He thong Quan ly Giong Cay trong, xay dung bang NestJS + TypeORM + PostgreSQL.

---

## Tech Stack

- **Framework:** NestJS (Node.js)
- **ORM:** TypeORM
- **Database:** PostgreSQL
- **Authentication:** JWT + Refresh Token
- **File Storage:** Local hoac MinIO/S3
- **Queue:** Bull (cho email, canh bao tu dong)
- **Scheduler:** @nestjs/schedule (Cron jobs)

---

## Cau Truc Thu Muc

```
src/
├── main.ts
├── app.module.ts
│
├── config/
│   ├── database.config.ts
│   ├── jwt.config.ts
│   ├── file-upload.config.ts
│   └── index.ts
│
├── common/
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── permissions.decorator.ts
│   │   └── api-paginated-response.decorator.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── permissions.guard.ts
│   ├── interceptors/
│   │   ├── transform.interceptor.ts
│   │   └── logging.interceptor.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── pipes/
│   │   └── validation.pipe.ts
│   ├── dto/
│   │   ├── pagination.dto.ts
│   │   ├── base-response.dto.ts
│   │   └── query-filter.dto.ts
│   └── utils/
│       ├── code-generator.util.ts
│       ├── tree.util.ts
│       └── excel.util.ts
│
├── database/
│   ├── database.module.ts
│   ├── migrations/
│   └── seeds/
│
├── modules/
│   ├── auth/
│   ├── users/
│   ├── catalog/
│   ├── samples/
│   ├── warehouse/
│   ├── alerts/
│   ├── reports/
│   ├── qrcode/
│   └── file-upload/
│
└── shared/
    ├── constants/
    └── types/
```

---

## DATABASE SCHEMA

### Quy uoc dat ten
- Ten bang: snake_case, so nhieu (seed_categories, samples)
- Khoa chinh: id (UUID)
- Khoa ngoai: {table_name}_id
- Timestamps: created_at, updated_at, deleted_at (soft delete)
- Audit fields: created_by, updated_by

---

### BANG 1: users (Nguoi dung)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
```

### BANG 2: roles (Vai tro)
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### BANG 3: user_roles (Phan quyen)
```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    role_id UUID REFERENCES roles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);
```

### BANG 4: permissions (Quyen han)
```sql
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    module VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### BANG 5: role_permissions
```sql
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES roles(id),
    permission_id UUID REFERENCES permissions(id),
    UNIQUE(role_id, permission_id)
);
```

### BANG 6: seed_categories (Loai/Nhom giong - Cay phan cap)
```sql
CREATE TABLE seed_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES seed_categories(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    level INT DEFAULT 0,
    path VARCHAR(500),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);
```

### BANG 7: seed_varieties (Danh muc giong)
```sql
CREATE TABLE seed_varieties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES seed_categories(id) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    scientific_name VARCHAR(200),
    local_name VARCHAR(200),
    origin VARCHAR(200),
    characteristics TEXT,
    growth_duration VARCHAR(100),
    yield_potential VARCHAR(100),
    disease_resistance TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);
```

### BANG 8: locations (Danh muc dia phuong - Cay phan cap)
```sql
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES locations(id),
    code VARCHAR(20) NOT NULL,
    name VARCHAR(150) NOT NULL,
    level INT NOT NULL,
    path VARCHAR(500),
    full_path_name VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### BANG 9: sample_providers (Noi cung cap mau)
```sql
CREATE TABLE sample_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL,
    address TEXT,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);
```

### BANG 10: warehouses (Kho luu giu)
```sql
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(300),
    storage_temp DECIMAL(5,2),
    humidity_range VARCHAR(50),
    max_capacity INT,
    current_usage INT DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);
```

### BANG 11: storage_locations (Vi tri dat mau - Tu/Ke/Ngan)
```sql
CREATE TABLE storage_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID REFERENCES warehouses(id) NOT NULL,
    parent_id UUID REFERENCES storage_locations(id),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(20) NOT NULL,
    level INT NOT NULL,
    path VARCHAR(500),
    capacity INT,
    current_usage INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'EMPTY',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(warehouse_id, code)
);
```

### BANG 12: staff (Danh muc can bo)
```sql
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    department VARCHAR(150),
    position VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    roles VARCHAR(100)[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### BANG 13: export_reasons (Ly do xuat kho)
```sql
CREATE TABLE export_reasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    requires_approval BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### BANG 14: evaluation_stages (Giai doan danh gia)
```sql
CREATE TABLE evaluation_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    months_after_storage INT,
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### BANG 15: evaluation_criteria (Tieu chi danh gia)
```sql
CREATE TABLE evaluation_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    unit VARCHAR(50),
    min_value DECIMAL(10,2),
    max_value DECIMAL(10,2),
    passing_value DECIMAL(10,2),
    data_type VARCHAR(20) DEFAULT 'NUMBER',
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### BANG 16: stage_criteria (Tieu chi theo giai doan)
```sql
CREATE TABLE stage_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id UUID REFERENCES evaluation_stages(id) NOT NULL,
    criteria_id UUID REFERENCES evaluation_criteria(id) NOT NULL,
    is_required BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    UNIQUE(stage_id, criteria_id)
);
```

### BANG 17: custom_category_groups (Nhom danh muc tuy chinh)
```sql
CREATE TABLE custom_category_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### BANG 18: custom_category_items (Gia tri danh muc tuy chinh)
```sql
CREATE TABLE custom_category_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES custom_category_groups(id) NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    value VARCHAR(500),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, code)
);
```

### BANG 19: samples (Mau giong - BANG CHINH)
```sql
CREATE TABLE samples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    variety_id UUID REFERENCES seed_varieties(id),
    category_id UUID REFERENCES seed_categories(id) NOT NULL,
    variety_name VARCHAR(200),
    local_name VARCHAR(200),
    scientific_name VARCHAR(200),
    collection_date DATE NOT NULL,
    collection_year INT NOT NULL,
    season VARCHAR(50),
    location_id UUID REFERENCES locations(id),
    location_detail TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    altitude DECIMAL(8, 2),
    provider_id UUID REFERENCES sample_providers(id),
    provider_name VARCHAR(200),
    collector_id UUID REFERENCES staff(id),
    initial_quantity DECIMAL(12, 2),
    current_quantity DECIMAL(12, 2),
    quantity_unit VARCHAR(20) DEFAULT 'gram',
    morphology TEXT,
    characteristics TEXT,
    sample_condition VARCHAR(50),
    status VARCHAR(30) DEFAULT 'COLLECTED',
    current_warehouse_id UUID REFERENCES warehouses(id),
    current_location_id UUID REFERENCES storage_locations(id),
    last_evaluation_date DATE,
    last_germination_rate DECIMAL(5, 2),
    storage_date DATE,
    expiry_date DATE,
    next_evaluation_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP
);
```

### BANG 20: sample_attachments (File dinh kem mau)
```sql
CREATE TABLE sample_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sample_id UUID REFERENCES samples(id) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    file_type VARCHAR(30),
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by UUID REFERENCES users(id)
);
```

### BANG 21: sample_evaluations (Danh gia mau)
```sql
CREATE TABLE sample_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sample_id UUID REFERENCES samples(id) NOT NULL,
    stage_id UUID REFERENCES evaluation_stages(id) NOT NULL,
    evaluation_date DATE NOT NULL,
    evaluator_id UUID REFERENCES staff(id),
    overall_result VARCHAR(20),
    germination_rate DECIMAL(5, 2),
    conclusion TEXT,
    recommendations TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);
```

### BANG 22: evaluation_results (Chi tiet ket qua danh gia)
```sql
CREATE TABLE evaluation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID REFERENCES sample_evaluations(id) NOT NULL,
    criteria_id UUID REFERENCES evaluation_criteria(id) NOT NULL,
    numeric_value DECIMAL(10, 2),
    text_value TEXT,
    is_passed BOOLEAN,
    notes TEXT,
    UNIQUE(evaluation_id, criteria_id)
);
```

### BANG 23: evaluation_images (Anh danh gia)
```sql
CREATE TABLE evaluation_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID REFERENCES sample_evaluations(id) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### BANG 24: propagation_batches (Dot nhan mau)
```sql
CREATE TABLE propagation_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    season VARCHAR(50),
    year INT NOT NULL,
    start_date DATE,
    expected_end_date DATE,
    actual_end_date DATE,
    location VARCHAR(300),
    supervisor_id UUID REFERENCES staff(id),
    status VARCHAR(30) DEFAULT 'PLANNED',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);
```

### BANG 25: propagation_items (Chi tiet mau nhan)
```sql
CREATE TABLE propagation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES propagation_batches(id) NOT NULL,
    sample_id UUID REFERENCES samples(id) NOT NULL,
    seed_quantity DECIMAL(12, 2),
    seed_unit VARCHAR(20),
    harvested_quantity DECIMAL(12, 2),
    harvest_date DATE,
    quality_notes TEXT,
    status VARCHAR(30) DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### BANG 26: warehouse_receipts (Phieu nhap kho)
```sql
CREATE TABLE warehouse_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    warehouse_id UUID REFERENCES warehouses(id) NOT NULL,
    receipt_date DATE NOT NULL,
    source_type VARCHAR(30),
    source_reference VARCHAR(100),
    total_items INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'DRAFT',
    confirmed_at TIMESTAMP,
    confirmed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);
```

### BANG 27: warehouse_receipt_items (Chi tiet phieu nhap)
```sql
CREATE TABLE warehouse_receipt_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID REFERENCES warehouse_receipts(id) NOT NULL,
    sample_id UUID REFERENCES samples(id) NOT NULL,
    location_id UUID REFERENCES storage_locations(id) NOT NULL,
    quantity DECIMAL(12, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### BANG 28: warehouse_exports (Phieu xuat kho)
```sql
CREATE TABLE warehouse_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    export_number VARCHAR(50) UNIQUE NOT NULL,
    warehouse_id UUID REFERENCES warehouses(id) NOT NULL,
    export_date DATE NOT NULL,
    reason_id UUID REFERENCES export_reasons(id) NOT NULL,
    recipient_name VARCHAR(200),
    recipient_address TEXT,
    recipient_contact VARCHAR(100),
    total_items INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'DRAFT',
    submitted_at TIMESTAMP,
    submitted_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);
```

### BANG 29: warehouse_export_items (Chi tiet phieu xuat)
```sql
CREATE TABLE warehouse_export_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    export_id UUID REFERENCES warehouse_exports(id) NOT NULL,
    sample_id UUID REFERENCES samples(id) NOT NULL,
    location_id UUID REFERENCES storage_locations(id),
    quantity DECIMAL(12, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### BANG 30: warehouse_transfers (Phieu chuyen kho)
```sql
CREATE TABLE warehouse_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_number VARCHAR(50) UNIQUE NOT NULL,
    from_warehouse_id UUID REFERENCES warehouses(id) NOT NULL,
    to_warehouse_id UUID REFERENCES warehouses(id) NOT NULL,
    transfer_date DATE NOT NULL,
    total_items INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'DRAFT',
    confirmed_at TIMESTAMP,
    confirmed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);
```

### BANG 31: warehouse_transfer_items (Chi tiet chuyen kho)
```sql
CREATE TABLE warehouse_transfer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id UUID REFERENCES warehouse_transfers(id) NOT NULL,
    sample_id UUID REFERENCES samples(id) NOT NULL,
    from_location_id UUID REFERENCES storage_locations(id),
    to_location_id UUID REFERENCES storage_locations(id) NOT NULL,
    quantity DECIMAL(12, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### BANG 32: inventory_transactions (Lich su bien dong kho)
```sql
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sample_id UUID REFERENCES samples(id) NOT NULL,
    warehouse_id UUID REFERENCES warehouses(id) NOT NULL,
    location_id UUID REFERENCES storage_locations(id),
    transaction_type VARCHAR(20) NOT NULL,
    quantity DECIMAL(12, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    balance_before DECIMAL(12, 2),
    balance_after DECIMAL(12, 2),
    reference_type VARCHAR(30),
    reference_id UUID,
    reference_number VARCHAR(50),
    transaction_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);
```

### BANG 33: alert_configs (Cau hinh canh bao)
```sql
CREATE TABLE alert_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    threshold_value DECIMAL(10, 2),
    threshold_unit VARCHAR(30),
    is_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT false,
    email_recipients TEXT[],
    email_frequency VARCHAR(20),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id)
);
```

### BANG 34: alerts (Canh bao)
```sql
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type VARCHAR(50) NOT NULL,
    sample_id UUID REFERENCES samples(id),
    warehouse_id UUID REFERENCES warehouses(id),
    title VARCHAR(200) NOT NULL,
    message TEXT,
    severity VARCHAR(20) DEFAULT 'WARNING',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    read_by UUID REFERENCES users(id),
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### BANG 35: saved_filters (Bo loc da luu)
```sql
CREATE TABLE saved_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    name VARCHAR(150) NOT NULL,
    module VARCHAR(50) NOT NULL,
    filter_config JSONB NOT NULL,
    column_config JSONB,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API ENDPOINTS

### Authentication
```
POST   /api/auth/login              # Dang nhap
POST   /api/auth/register           # Dang ky (admin only)
POST   /api/auth/refresh            # Refresh token
POST   /api/auth/logout             # Dang xuat
GET    /api/auth/me                 # Thong tin user hien tai
PUT    /api/auth/change-password    # Doi mat khau
```

### Users & Roles
```
GET    /api/users                   # Danh sach users
POST   /api/users                   # Tao user
GET    /api/users/:id               # Chi tiet user
PUT    /api/users/:id               # Cap nhat user
DELETE /api/users/:id               # Xoa user
PUT    /api/users/:id/roles         # Gan roles
GET    /api/roles                   # Danh sach roles
GET    /api/permissions             # Danh sach permissions
```

### Catalog - Seed Categories
```
GET    /api/catalog/seed-categories
GET    /api/catalog/seed-categories/tree
POST   /api/catalog/seed-categories
GET    /api/catalog/seed-categories/:id
PUT    /api/catalog/seed-categories/:id
DELETE /api/catalog/seed-categories/:id
PUT    /api/catalog/seed-categories/reorder
GET    /api/catalog/seed-categories/:id/children
```

### Catalog - Seed Varieties
```
GET    /api/catalog/seed-varieties
POST   /api/catalog/seed-varieties
GET    /api/catalog/seed-varieties/:id
PUT    /api/catalog/seed-varieties/:id
DELETE /api/catalog/seed-varieties/:id
POST   /api/catalog/seed-varieties/import
GET    /api/catalog/seed-varieties/export
GET    /api/catalog/seed-varieties/template
```

### Catalog - Locations
```
GET    /api/catalog/locations
GET    /api/catalog/locations/tree
GET    /api/catalog/locations/provinces
GET    /api/catalog/locations/:id/children
POST   /api/catalog/locations
PUT    /api/catalog/locations/:id
DELETE /api/catalog/locations/:id
POST   /api/catalog/locations/import
```

### Catalog - Warehouses
```
GET    /api/catalog/warehouses
POST   /api/catalog/warehouses
GET    /api/catalog/warehouses/:id
PUT    /api/catalog/warehouses/:id
DELETE /api/catalog/warehouses/:id
GET    /api/catalog/warehouses/:id/usage
GET    /api/catalog/warehouses/:id/locations
```

### Catalog - Storage Locations
```
GET    /api/catalog/storage-locations
GET    /api/catalog/storage-locations/tree
POST   /api/catalog/storage-locations
PUT    /api/catalog/storage-locations/:id
DELETE /api/catalog/storage-locations/:id
GET    /api/catalog/storage-locations/:id/status
GET    /api/catalog/storage-locations/available
```

### Catalog - Staff
```
GET    /api/catalog/staff
POST   /api/catalog/staff
GET    /api/catalog/staff/:id
PUT    /api/catalog/staff/:id
DELETE /api/catalog/staff/:id
GET    /api/catalog/staff/by-role/:role
```

### Catalog - Sample Providers
```
GET    /api/catalog/sample-providers
POST   /api/catalog/sample-providers
GET    /api/catalog/sample-providers/:id
PUT    /api/catalog/sample-providers/:id
DELETE /api/catalog/sample-providers/:id
```

### Catalog - Others
```
GET/POST/PUT/DELETE /api/catalog/export-reasons
GET/POST/PUT/DELETE /api/catalog/evaluation-stages
GET/POST/PUT/DELETE /api/catalog/evaluation-criteria
PUT    /api/catalog/evaluation-stages/:id/criteria
GET    /api/catalog/custom-groups
POST   /api/catalog/custom-groups
PUT    /api/catalog/custom-groups/:id
DELETE /api/catalog/custom-groups/:id
GET    /api/catalog/custom-groups/:id/items
POST   /api/catalog/custom-items
PUT    /api/catalog/custom-items/:id
DELETE /api/catalog/custom-items/:id
```

### Samples - Collection
```
GET    /api/samples
POST   /api/samples
GET    /api/samples/:id
PUT    /api/samples/:id
DELETE /api/samples/:id
GET    /api/samples/:id/history
GET    /api/samples/:id/evaluations
GET    /api/samples/:id/attachments
POST   /api/samples/:id/attachments
DELETE /api/samples/:id/attachments/:attachmentId
GET    /api/samples/generate-code
```

### Samples - Evaluation
```
GET    /api/evaluations
POST   /api/evaluations
GET    /api/evaluations/:id
PUT    /api/evaluations/:id
DELETE /api/evaluations/:id
POST   /api/evaluations/:id/images
DELETE /api/evaluations/:id/images/:imageId
GET    /api/evaluations/pending
GET    /api/evaluations/by-sample/:sampleId
```

### Samples - Propagation
```
GET    /api/propagation/batches
POST   /api/propagation/batches
GET    /api/propagation/batches/:id
PUT    /api/propagation/batches/:id
DELETE /api/propagation/batches/:id
PUT    /api/propagation/batches/:id/status
POST   /api/propagation/batches/:id/items
PUT    /api/propagation/items/:itemId
DELETE /api/propagation/items/:itemId
```

### QR Code & Seed Card
```
GET    /api/samples/:id/qrcode
GET    /api/samples/:id/seed-card
GET    /api/samples/:id/seed-card/pdf
POST   /api/samples/seed-cards/batch-print
GET    /api/samples/by-qr/:code
```

### Warehouse - Receipts
```
GET    /api/warehouse/receipts
POST   /api/warehouse/receipts
GET    /api/warehouse/receipts/:id
PUT    /api/warehouse/receipts/:id
DELETE /api/warehouse/receipts/:id
PUT    /api/warehouse/receipts/:id/confirm
GET    /api/warehouse/receipts/:id/print
GET    /api/warehouse/receipts/:id/labels
```

### Warehouse - Exports
```
GET    /api/warehouse/exports
POST   /api/warehouse/exports
GET    /api/warehouse/exports/:id
PUT    /api/warehouse/exports/:id
DELETE /api/warehouse/exports/:id
PUT    /api/warehouse/exports/:id/submit
PUT    /api/warehouse/exports/:id/approve
PUT    /api/warehouse/exports/:id/reject
PUT    /api/warehouse/exports/:id/complete
GET    /api/warehouse/exports/:id/print
GET    /api/warehouse/exports/pending-approval
POST   /api/warehouse/exports/:id/scan-qr
```

### Warehouse - Transfers
```
GET    /api/warehouse/transfers
POST   /api/warehouse/transfers
GET    /api/warehouse/transfers/:id
PUT    /api/warehouse/transfers/:id
DELETE /api/warehouse/transfers/:id
PUT    /api/warehouse/transfers/:id/confirm
GET    /api/warehouse/transfers/:id/print
GET    /api/warehouse/transfers/:id/new-labels
POST   /api/warehouse/transfers/:id/scan-qr
```

### Warehouse - Inventory
```
GET    /api/warehouse/inventory
GET    /api/warehouse/inventory/by-warehouse/:id
GET    /api/warehouse/inventory/sample/:id
GET    /api/warehouse/inventory/sample/:id/transactions
GET    /api/warehouse/stock-summary
GET    /api/warehouse/stock-summary/by-period
GET    /api/warehouse/stock-summary/by-category
GET    /api/warehouse/stock-summary/chart
GET    /api/warehouse/stock-summary/export
```

### Alerts
```
GET    /api/alerts
GET    /api/alerts/dashboard
GET    /api/alerts/unread-count
PUT    /api/alerts/:id/read
PUT    /api/alerts/:id/resolve
PUT    /api/alerts/read-all
GET    /api/alerts/overdue-evaluation
GET    /api/alerts/near-expiry
GET    /api/alerts/low-germination
GET    /api/alerts/low-stock
GET    /api/alerts/config
PUT    /api/alerts/config/:type
PUT    /api/alerts/config/:type/email
```

### Reports
```
POST   /api/reports/advanced-search
GET    /api/reports/advanced-search/fields
POST   /api/reports/advanced-search/export
GET    /api/reports/saved-filters
POST   /api/reports/saved-filters
PUT    /api/reports/saved-filters/:id
DELETE /api/reports/saved-filters/:id
GET    /api/reports/annual
GET    /api/reports/annual/summary
GET    /api/reports/annual/by-category
GET    /api/reports/annual/comparison
GET    /api/reports/annual/low-germination
GET    /api/reports/annual/propagation-activity
GET    /api/reports/annual/export
GET    /api/reports/annual/print
```

---

## YEU CAU KY THUAT

### 1. Authentication & Authorization

```typescript
// JWT Payload
interface JwtPayload {
  sub: string;
  username: string;
  roles: string[];
  permissions: string[];
}

// Permissions
const PERMISSIONS = {
  'catalog.seed_category.read': 'Xem loai giong',
  'catalog.seed_category.create': 'Tao loai giong',
  'catalog.seed_category.update': 'Sua loai giong',
  'catalog.seed_category.delete': 'Xoa loai giong',
  'sample.read': 'Xem mau giong',
  'sample.create': 'Tao phieu thu thap',
  'sample.update': 'Sua thong tin mau',
  'sample.delete': 'Xoa mau',
  'sample.evaluate': 'Danh gia mau',
  'sample.propagate': 'Quan ly nhan mau',
  'warehouse.receipt.create': 'Tao phieu nhap',
  'warehouse.receipt.confirm': 'Xac nhan nhap kho',
  'warehouse.export.create': 'Tao phieu xuat',
  'warehouse.export.approve': 'Duyet phieu xuat',
  'warehouse.transfer.create': 'Tao phieu chuyen',
  'report.view': 'Xem bao cao',
  'report.export': 'Xuat bao cao',
  'admin.users': 'Quan ly users',
  'admin.config': 'Cau hinh he thong',
};
```

### 2. Pagination & Filtering

```typescript
class PaginationDto {
  page?: number = 1;
  limit?: number = 20;
  sortBy?: string = 'createdAt';
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
  search?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

### 3. Sample Code Generation

```typescript
// Format: {PREFIX}{YEAR}{SEQUENCE}
// Vi du: SM2024000001, SM2024000002

async generateSampleCode(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = 'SM';
  // ... logic sinh ma tu dong
  return `${prefix}${year}${sequence.toString().padStart(6, '0')}`;
}
```

### 4. Export Status Workflow

```typescript
enum ExportStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPORTED = 'EXPORTED',
  CANCELLED = 'CANCELLED'
}

const ALLOWED_TRANSITIONS = {
  DRAFT: ['PENDING_APPROVAL', 'CANCELLED'],
  PENDING_APPROVAL: ['APPROVED', 'REJECTED'],
  APPROVED: ['EXPORTED', 'CANCELLED'],
  REJECTED: ['DRAFT', 'CANCELLED'],
  EXPORTED: [],
  CANCELLED: []
};
```

---

## BIEN MOI TRUONG (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=seed_management

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis (for Queue)
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## HUONG DAN CAI DAT

```bash
# Cai dat dependencies
npm install

# Chay migrations
npm run migration:run

# Seed data
npm run seed:run

# Chay development
npm run start:dev

# Build production
npm run build
npm run start:prod
```

---

*Version: 1.0 | Cap nhat: 01/2026*
