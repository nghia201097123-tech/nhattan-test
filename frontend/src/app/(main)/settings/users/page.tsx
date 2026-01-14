'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  Tag,
  message,
  Popconfirm,
  Select,
  Typography,
  Card,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  KeyOutlined,
  UserOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { usersService, rolesService } from '@/services/users.service';
import { User, Role } from '@/types';

const { Title } = Typography;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Modals
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [userForm] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const fetchUsers = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const result = await usersService.getAll({ page, limit: pageSize });
      setUsers(result.data);
      setPagination({ current: page, pageSize, total: result.total });
    } catch (error) {
      message.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const result = await rolesService.getAll();
      setRoles(result);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // Create/Edit User
  const handleUserSubmit = async (values: any) => {
    try {
      if (selectedUser) {
        await usersService.update(selectedUser.id, values);
        message.success('Cập nhật người dùng thành công');
      } else {
        await usersService.create(values);
        message.success('Tạo người dùng thành công');
      }
      setUserModalOpen(false);
      userForm.resetFields();
      setSelectedUser(null);
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Assign Roles
  const handleRoleSubmit = async (values: any) => {
    if (!selectedUser) return;
    try {
      await usersService.assignRoles(selectedUser.id, values.roleIds);
      message.success('Cập nhật vai trò thành công');
      setRoleModalOpen(false);
      roleForm.resetFields();
      setSelectedUser(null);
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Reset Password
  const handlePasswordSubmit = async (values: any) => {
    if (!selectedUser) return;
    try {
      await usersService.resetPassword(selectedUser.id, values.newPassword);
      message.success('Đặt lại mật khẩu thành công');
      setPasswordModalOpen(false);
      passwordForm.resetFields();
      setSelectedUser(null);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Toggle Status
  const handleToggleStatus = async (user: User) => {
    try {
      await usersService.toggleStatus(user.id, !user.isActive);
      message.success(`${user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} tài khoản thành công`);
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Delete User
  const handleDelete = async (id: string) => {
    try {
      await usersService.delete(id);
      message.success('Xóa người dùng thành công');
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const columns = [
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: Role[]) => (
        <Space size={[0, 4]} wrap>
          {roles?.map((role) => (
            <Tag key={role.id} color="blue">{role.name}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: User) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleStatus(record)}
          checkedChildren="Hoạt động"
          unCheckedChildren="Khóa"
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedUser(record);
              userForm.setFieldsValue(record);
              setUserModalOpen(true);
            }}
          />
          <Button
            type="text"
            icon={<SafetyOutlined />}
            onClick={() => {
              setSelectedUser(record);
              roleForm.setFieldsValue({
                roleIds: record.roles?.map((r) => r.id) || [],
              });
              setRoleModalOpen(true);
            }}
          />
          <Button
            type="text"
            icon={<KeyOutlined />}
            onClick={() => {
              setSelectedUser(record);
              setPasswordModalOpen(true);
            }}
          />
          <Popconfirm
            title="Xác nhận xóa người dùng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Quản lý người dùng</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedUser(null);
            userForm.resetFields();
            setUserModalOpen(true);
          }}
        >
          Thêm người dùng
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} người dùng`,
            onChange: (page, pageSize) => fetchUsers(page, pageSize),
          }}
        />
      </Card>

      {/* Create/Edit User Modal */}
      <Modal
        title={selectedUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        open={userModalOpen}
        onCancel={() => {
          setUserModalOpen(false);
          setSelectedUser(null);
          userForm.resetFields();
        }}
        onOk={() => userForm.submit()}
        okText={selectedUser ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
      >
        <Form form={userForm} layout="vertical" onFinish={handleUserSubmit}>
          {!selectedUser && (
            <Form.Item
              name="username"
              label="Tên đăng nhập"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
            </Form.Item>
          )}
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Họ và tên" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input placeholder="Số điện thoại" />
          </Form.Item>
          {!selectedUser && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            >
              <Input.Password placeholder="Mật khẩu" />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Assign Roles Modal */}
      <Modal
        title={`Phân quyền cho: ${selectedUser?.fullName}`}
        open={roleModalOpen}
        onCancel={() => {
          setRoleModalOpen(false);
          setSelectedUser(null);
          roleForm.resetFields();
        }}
        onOk={() => roleForm.submit()}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={roleForm} layout="vertical" onFinish={handleRoleSubmit}>
          <Form.Item
            name="roleIds"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn ít nhất một vai trò' }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn vai trò"
              options={roles.map((role) => ({
                value: role.id,
                label: role.name,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        title={`Đặt lại mật khẩu cho: ${selectedUser?.fullName}`}
        open={passwordModalOpen}
        onCancel={() => {
          setPasswordModalOpen(false);
          setSelectedUser(null);
          passwordForm.resetFields();
        }}
        onOk={() => passwordForm.submit()}
        okText="Đặt lại"
        cancelText="Hủy"
      >
        <Form form={passwordForm} layout="vertical" onFinish={handlePasswordSubmit}>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
            ]}
          >
            <Input.Password placeholder="Mật khẩu mới" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Xác nhận mật khẩu" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
