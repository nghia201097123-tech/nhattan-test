'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Typography,
  Collapse,
  Space,
  Badge,
  Button,
  Modal,
  Form,
  Input,
  Checkbox,
  message,
  Popconfirm,
  Divider,
} from 'antd';
import {
  SafetyOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { rolesService } from '@/services/users.service';
import { Role, Permission } from '@/types';

const { Title, Text } = Typography;
const { Panel } = Collapse;

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const [roleForm] = Form.useForm();
  const [permissionForm] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesData, permissionsData] = await Promise.all([
        rolesService.getAll(),
        rolesService.getPermissions(),
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const moduleNames: Record<string, string> = {
    catalog: 'Danh mục',
    sample: 'Mẫu giống',
    warehouse: 'Kho',
    report: 'Báo cáo',
    admin: 'Quản trị',
  };

  // Create/Edit Role
  const handleRoleSubmit = async (values: any) => {
    try {
      if (selectedRole) {
        await rolesService.update(selectedRole.id, values);
        message.success('Cập nhật vai trò thành công');
      } else {
        await rolesService.create(values);
        message.success('Tạo vai trò thành công');
      }
      setRoleModalOpen(false);
      roleForm.resetFields();
      setSelectedRole(null);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Update Permissions
  const handlePermissionSubmit = async (values: any) => {
    if (!selectedRole) return;
    try {
      await rolesService.updatePermissions(selectedRole.id, values.permissionIds || []);
      message.success('Cập nhật quyền thành công');
      setPermissionModalOpen(false);
      permissionForm.resetFields();
      setSelectedRole(null);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Delete Role
  const handleDeleteRole = async (id: string) => {
    try {
      await rolesService.delete(id);
      message.success('Xóa vai trò thành công');
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const columns = [
    {
      title: 'Mã vai trò',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => (
        <Tag color={code === 'ADMIN' ? 'red' : 'blue'}>{code}</Tag>
      ),
    },
    {
      title: 'Tên vai trò',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Số quyền',
      dataIndex: 'permissions',
      key: 'permissionCount',
      render: (perms: Permission[]) => (
        <Badge count={perms?.length || 0} showZero color="#52c41a" />
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_: any, record: Role) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            title="Sửa thông tin"
            onClick={() => {
              setSelectedRole(record);
              roleForm.setFieldsValue(record);
              setRoleModalOpen(true);
            }}
          />
          <Button
            type="text"
            icon={<SettingOutlined />}
            title="Phân quyền"
            onClick={() => {
              setSelectedRole(record);
              permissionForm.setFieldsValue({
                permissionIds: record.permissions?.map((p) => p.id) || [],
              });
              setPermissionModalOpen(true);
            }}
          />
          {record.code !== 'ADMIN' && (
            <Popconfirm
              title="Xác nhận xóa vai trò này?"
              description="Người dùng có vai trò này sẽ mất quyền tương ứng."
              onConfirm={() => handleDeleteRole(record.id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button type="text" danger icon={<DeleteOutlined />} title="Xóa" />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Quản lý vai trò & quyền hạn</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedRole(null);
            roleForm.resetFields();
            setRoleModalOpen(true);
          }}
        >
          Thêm vai trò
        </Button>
      </div>

      <Card title="Danh sách vai trò" style={{ marginBottom: 24 }} loading={loading}>
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          pagination={false}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: '12px 0' }}>
                <Text strong>Quyền hạn:</Text>
                <div style={{ marginTop: 8 }}>
                  <Space size={[4, 8]} wrap>
                    {record.permissions?.map((perm) => (
                      <Tag key={perm.id} icon={<CheckCircleOutlined />} color="green">
                        {perm.name}
                      </Tag>
                    ))}
                    {(!record.permissions || record.permissions.length === 0) && (
                      <Text type="secondary">Chưa có quyền nào</Text>
                    )}
                  </Space>
                </div>
              </div>
            ),
          }}
        />
      </Card>

      <Card title="Danh sách quyền hạn theo module" loading={loading}>
        <Collapse defaultActiveKey={Object.keys(groupedPermissions)}>
          {Object.entries(groupedPermissions).map(([module, perms]) => (
            <Panel
              header={
                <Space>
                  <SafetyOutlined />
                  <span>{moduleNames[module] || module}</span>
                  <Badge count={perms.length} style={{ backgroundColor: '#1890ff' }} />
                </Space>
              }
              key={module}
            >
              <Table
                size="small"
                dataSource={perms}
                rowKey="id"
                pagination={false}
                columns={[
                  {
                    title: 'Mã quyền',
                    dataIndex: 'code',
                    key: 'code',
                    render: (code: string) => <Tag>{code}</Tag>,
                  },
                  {
                    title: 'Tên quyền',
                    dataIndex: 'name',
                    key: 'name',
                  },
                ]}
              />
            </Panel>
          ))}
        </Collapse>
      </Card>

      {/* Create/Edit Role Modal */}
      <Modal
        title={selectedRole ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}
        open={roleModalOpen}
        onCancel={() => {
          setRoleModalOpen(false);
          setSelectedRole(null);
          roleForm.resetFields();
        }}
        onOk={() => roleForm.submit()}
        okText={selectedRole ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        width={500}
      >
        <Form form={roleForm} layout="vertical" onFinish={handleRoleSubmit}>
          {!selectedRole && (
            <Form.Item
              name="code"
              label="Mã vai trò"
              rules={[
                { required: true, message: 'Vui lòng nhập mã vai trò' },
                { pattern: /^[A-Z_]+$/, message: 'Mã chỉ gồm chữ in hoa và dấu _' },
              ]}
            >
              <Input placeholder="VD: WAREHOUSE_STAFF" style={{ textTransform: 'uppercase' }} />
            </Form.Item>
          )}
          <Form.Item
            name="name"
            label="Tên vai trò"
            rules={[{ required: true, message: 'Vui lòng nhập tên vai trò' }]}
          >
            <Input placeholder="VD: Nhân viên kho" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea placeholder="Mô tả vai trò" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Assign Permissions Modal */}
      <Modal
        title={`Phân quyền cho vai trò: ${selectedRole?.name}`}
        open={permissionModalOpen}
        onCancel={() => {
          setPermissionModalOpen(false);
          setSelectedRole(null);
          permissionForm.resetFields();
        }}
        onOk={() => permissionForm.submit()}
        okText="Cập nhật"
        cancelText="Hủy"
        width={700}
      >
        <Form form={permissionForm} layout="vertical" onFinish={handlePermissionSubmit}>
          <Form.Item name="permissionIds">
            <Checkbox.Group style={{ width: '100%' }}>
              {Object.entries(groupedPermissions).map(([module, perms]) => (
                <div key={module} style={{ marginBottom: 16 }}>
                  <Divider orientation="left" orientationMargin={0}>
                    <Space>
                      <SafetyOutlined />
                      {moduleNames[module] || module}
                    </Space>
                  </Divider>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {perms.map((perm) => (
                      <Checkbox key={perm.id} value={perm.id}>
                        {perm.name}
                      </Checkbox>
                    ))}
                  </div>
                </div>
              ))}
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
