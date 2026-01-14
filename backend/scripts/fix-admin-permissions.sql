-- =====================================================
-- Script: Fix Admin Permissions
-- Đảm bảo admin có tất cả quyền
-- =====================================================

-- 1. Đảm bảo permission admin.users tồn tại
INSERT INTO permissions (id, code, name, module, created_at) VALUES
  ('a1000000-0000-0000-0000-000000000026', 'admin.users', 'Quản lý users', 'admin', NOW())
ON CONFLICT (code) DO UPDATE SET name = 'Quản lý users', module = 'admin';

-- 2. Gán TẤT CẢ quyền cho vai trò ADMIN
DELETE FROM role_permissions WHERE role_id = 'b1000000-0000-0000-0000-000000000001';
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'b1000000-0000-0000-0000-000000000001', id FROM permissions;

-- 3. Kiểm tra kết quả
SELECT 'Admin role now has ' || COUNT(*) || ' permissions' as result
FROM role_permissions
WHERE role_id = 'b1000000-0000-0000-0000-000000000001';

-- 4. Liệt kê các quyền của admin
SELECT p.code, p.name, p.module
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
WHERE rp.role_id = 'b1000000-0000-0000-0000-000000000001'
ORDER BY p.module, p.code;
