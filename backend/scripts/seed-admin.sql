-- =====================================================
-- Script: Seed Admin Account for SeedVault System
-- Database: seed_management
-- Run: psql -U seed_admin -d seed_management -f seed-admin.sql
-- =====================================================

-- =====================================================
-- 1. Tạo Permissions (Quyền hạn) - Khớp với permissions.constant.ts
-- =====================================================
INSERT INTO permissions (id, code, name, module, created_at) VALUES
  -- Catalog
  ('a1000000-0000-0000-0000-000000000001', 'catalog.seed_category.read', 'Xem loại giống', 'catalog', NOW()),
  ('a1000000-0000-0000-0000-000000000002', 'catalog.seed_category.create', 'Tạo loại giống', 'catalog', NOW()),
  ('a1000000-0000-0000-0000-000000000003', 'catalog.seed_category.update', 'Sửa loại giống', 'catalog', NOW()),
  ('a1000000-0000-0000-0000-000000000004', 'catalog.seed_category.delete', 'Xóa loại giống', 'catalog', NOW()),
  ('a1000000-0000-0000-0000-000000000005', 'catalog.seed_variety.read', 'Xem giống cây', 'catalog', NOW()),
  ('a1000000-0000-0000-0000-000000000006', 'catalog.seed_variety.create', 'Tạo giống cây', 'catalog', NOW()),
  ('a1000000-0000-0000-0000-000000000007', 'catalog.seed_variety.update', 'Sửa giống cây', 'catalog', NOW()),
  ('a1000000-0000-0000-0000-000000000008', 'catalog.seed_variety.delete', 'Xóa giống cây', 'catalog', NOW()),
  ('a1000000-0000-0000-0000-000000000009', 'catalog.warehouse.read', 'Xem kho', 'catalog', NOW()),
  ('a1000000-0000-0000-0000-000000000010', 'catalog.warehouse.create', 'Tạo kho', 'catalog', NOW()),
  ('a1000000-0000-0000-0000-000000000011', 'catalog.warehouse.update', 'Sửa kho', 'catalog', NOW()),
  ('a1000000-0000-0000-0000-000000000012', 'catalog.warehouse.delete', 'Xóa kho', 'catalog', NOW()),
  -- Samples
  ('a1000000-0000-0000-0000-000000000013', 'sample.read', 'Xem mẫu giống', 'sample', NOW()),
  ('a1000000-0000-0000-0000-000000000014', 'sample.create', 'Tạo phiếu thu thập', 'sample', NOW()),
  ('a1000000-0000-0000-0000-000000000015', 'sample.update', 'Sửa thông tin mẫu', 'sample', NOW()),
  ('a1000000-0000-0000-0000-000000000016', 'sample.delete', 'Xóa mẫu', 'sample', NOW()),
  ('a1000000-0000-0000-0000-000000000017', 'sample.evaluate', 'Đánh giá mẫu', 'sample', NOW()),
  ('a1000000-0000-0000-0000-000000000018', 'sample.propagate', 'Quản lý nhân mẫu', 'sample', NOW()),
  -- Warehouse
  ('a1000000-0000-0000-0000-000000000019', 'warehouse.receipt.create', 'Tạo phiếu nhập', 'warehouse', NOW()),
  ('a1000000-0000-0000-0000-000000000020', 'warehouse.receipt.confirm', 'Xác nhận nhập kho', 'warehouse', NOW()),
  ('a1000000-0000-0000-0000-000000000021', 'warehouse.export.create', 'Tạo phiếu xuất', 'warehouse', NOW()),
  ('a1000000-0000-0000-0000-000000000022', 'warehouse.export.approve', 'Duyệt phiếu xuất', 'warehouse', NOW()),
  ('a1000000-0000-0000-0000-000000000023', 'warehouse.transfer.create', 'Tạo phiếu chuyển', 'warehouse', NOW()),
  -- Reports
  ('a1000000-0000-0000-0000-000000000024', 'report.view', 'Xem báo cáo', 'report', NOW()),
  ('a1000000-0000-0000-0000-000000000025', 'report.export', 'Xuất báo cáo', 'report', NOW()),
  -- Admin
  ('a1000000-0000-0000-0000-000000000026', 'admin.users', 'Quản lý users', 'admin', NOW()),
  ('a1000000-0000-0000-0000-000000000027', 'admin.config', 'Cấu hình hệ thống', 'admin', NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. Tạo Roles (Vai trò)
-- =====================================================
INSERT INTO roles (id, code, name, description, created_at) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'ADMIN', 'Quản trị viên', 'Toàn quyền quản trị hệ thống', NOW()),
  ('b1000000-0000-0000-0000-000000000002', 'MANAGER', 'Quản lý', 'Quản lý hoạt động nghiệp vụ', NOW()),
  ('b1000000-0000-0000-0000-000000000003', 'STAFF', 'Nhân viên', 'Nhân viên thao tác nghiệp vụ', NOW()),
  ('b1000000-0000-0000-0000-000000000004', 'VIEWER', 'Người xem', 'Chỉ có quyền xem', NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. Gán quyền cho vai trò Admin (tất cả quyền)
-- =====================================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'b1000000-0000-0000-0000-000000000001', id FROM permissions
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. Tạo User Admin
-- Password: Admin@123 (đã hash bằng bcrypt)
-- =====================================================
INSERT INTO users (id, username, email, password_hash, full_name, phone, is_active, created_at, updated_at) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'admin', 'admin@seedvault.com', '$2b$10$41vvXSy1eKryNL5leaqH/OW2H1OBTAmRj/Siqj907/kkkhERn.BYi', 'Administrator', '0901234567', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. Gán vai trò Admin cho user admin
-- =====================================================
INSERT INTO user_roles (user_id, role_id) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- =====================================================
-- Thông báo hoàn thành
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Seed Admin Account Complete!';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Admin Account:';
  RAISE NOTICE '  Username: admin';
  RAISE NOTICE '  Password: Admin@123';
  RAISE NOTICE '  Email: admin@seedvault.com';
  RAISE NOTICE '=====================================================';
END $$;
