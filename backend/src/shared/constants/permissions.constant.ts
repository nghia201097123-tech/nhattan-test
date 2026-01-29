export const PERMISSIONS = {
  // Catalog
  CATALOG_SEED_CATEGORY_READ: 'catalog.seed_category.read',
  CATALOG_SEED_CATEGORY_CREATE: 'catalog.seed_category.create',
  CATALOG_SEED_CATEGORY_UPDATE: 'catalog.seed_category.update',
  CATALOG_SEED_CATEGORY_DELETE: 'catalog.seed_category.delete',

  CATALOG_SEED_VARIETY_READ: 'catalog.seed_variety.read',
  CATALOG_SEED_VARIETY_CREATE: 'catalog.seed_variety.create',
  CATALOG_SEED_VARIETY_UPDATE: 'catalog.seed_variety.update',
  CATALOG_SEED_VARIETY_DELETE: 'catalog.seed_variety.delete',

  CATALOG_WAREHOUSE_READ: 'catalog.warehouse.read',
  CATALOG_WAREHOUSE_CREATE: 'catalog.warehouse.create',
  CATALOG_WAREHOUSE_UPDATE: 'catalog.warehouse.update',
  CATALOG_WAREHOUSE_DELETE: 'catalog.warehouse.delete',

  // Samples
  SAMPLE_READ: 'sample.read',
  SAMPLE_CREATE: 'sample.create',
  SAMPLE_UPDATE: 'sample.update',
  SAMPLE_DELETE: 'sample.delete',
  SAMPLE_EVALUATE: 'sample.evaluate',
  SAMPLE_PROPAGATE: 'sample.propagate',

  // Warehouse
  WAREHOUSE_RECEIPT_CREATE: 'warehouse.receipt.create',
  WAREHOUSE_RECEIPT_CONFIRM: 'warehouse.receipt.confirm',
  WAREHOUSE_EXPORT_CREATE: 'warehouse.export.create',
  WAREHOUSE_EXPORT_APPROVE: 'warehouse.export.approve',
  WAREHOUSE_TRANSFER_CREATE: 'warehouse.transfer.create',

  // Reports
  REPORT_VIEW: 'report.view',
  REPORT_EXPORT: 'report.export',

  // Admin
  ADMIN_USERS: 'admin.users',
  ADMIN_CONFIG: 'admin.config',
} as const;

export const PERMISSION_LIST = [
  { code: PERMISSIONS.CATALOG_SEED_CATEGORY_READ, name: 'Xem loại giống', module: 'catalog' },
  { code: PERMISSIONS.CATALOG_SEED_CATEGORY_CREATE, name: 'Tạo loại giống', module: 'catalog' },
  { code: PERMISSIONS.CATALOG_SEED_CATEGORY_UPDATE, name: 'Sửa loại giống', module: 'catalog' },
  { code: PERMISSIONS.CATALOG_SEED_CATEGORY_DELETE, name: 'Xóa loại giống', module: 'catalog' },
  { code: PERMISSIONS.SAMPLE_READ, name: 'Xem mẫu giống', module: 'sample' },
  { code: PERMISSIONS.SAMPLE_CREATE, name: 'Tạo phiếu thu thập', module: 'sample' },
  { code: PERMISSIONS.SAMPLE_UPDATE, name: 'Sửa thông tin mẫu', module: 'sample' },
  { code: PERMISSIONS.SAMPLE_DELETE, name: 'Xóa mẫu', module: 'sample' },
  { code: PERMISSIONS.SAMPLE_EVALUATE, name: 'Đánh giá mẫu', module: 'sample' },
  { code: PERMISSIONS.SAMPLE_PROPAGATE, name: 'Quản lý nhân mẫu', module: 'sample' },
  { code: PERMISSIONS.WAREHOUSE_RECEIPT_CREATE, name: 'Tạo phiếu nhập', module: 'warehouse' },
  { code: PERMISSIONS.WAREHOUSE_RECEIPT_CONFIRM, name: 'Xác nhận nhập kho', module: 'warehouse' },
  { code: PERMISSIONS.WAREHOUSE_EXPORT_CREATE, name: 'Tạo phiếu xuất', module: 'warehouse' },
  { code: PERMISSIONS.WAREHOUSE_EXPORT_APPROVE, name: 'Duyệt phiếu xuất', module: 'warehouse' },
  { code: PERMISSIONS.WAREHOUSE_TRANSFER_CREATE, name: 'Tạo phiếu chuyển', module: 'warehouse' },
  { code: PERMISSIONS.REPORT_VIEW, name: 'Xem báo cáo', module: 'report' },
  { code: PERMISSIONS.REPORT_EXPORT, name: 'Xuất báo cáo', module: 'report' },
  { code: PERMISSIONS.ADMIN_USERS, name: 'Quản lý users', module: 'admin' },
  { code: PERMISSIONS.ADMIN_CONFIG, name: 'Cấu hình hệ thống', module: 'admin' },
];
