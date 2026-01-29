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
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  KeyOutlined,
  UserOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { usersService, rolesService } from '@/services/users.service';
import { User, Role } from '@/types';

const { Title, Text } = Typography;

export default function StaffPage() {
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
      setPagination({ current: page, pageSize, total: result.meta?.total || 0 });
    } catch (error) {
      message.error('Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const rolesData = await rolesService.getAll();
      setRoles(rolesData);
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
        message.success('Cập nhật nhân viên thành công');
      } else {
        await usersService.create(values);
        message.success('Tạo nhân viên thành công');
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
      await usersService.assignRoles(selectedUser.id, values.roleIds || []);
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
      message.success(`${user.isActive ? 'Khóa' : 'Mở khóa'} tài khoản thành công`);
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Delete User
  const handleDelete = async (id: string) => {
    try {
      await usersService.delete(id);
      message.success('Xóa nhân viên thành công');
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
      render: (userRoles: Role[]) => (
        <Space size={[0, 4]} wrap>
          {userRoles?.map((role) => (
            <Tag key={role.id} color={role.code === 'ADMIN' ? 'red' : 'blue'}>
              {role.name}
            </Tag>
          ))}
          {(!userRoles || userRoles.length === 0) && <Text type="secondary">Chưa có</Text>}
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
      width: 180,
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            title="Sửa thông tin"
            onClick={() => {
              setSelectedUser(record);
              userForm.setFieldsValue(record);
              setUserModalOpen(true);
            }}
          />
          <Button
            type="text"
            icon={<TeamOutlined />}
            title="Phân vai trò"
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
            title="Đặt lại mật khẩu"
            onClick={() => {
              setSelectedUser(record);
              setPasswordModalOpen(true);
            }}
          />
          <Popconfirm
            title="Xác nhận xóa nhân viên này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} title="Xóa" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Quản lý nhân viên</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedUser(null);
            userForm.resetFields();
            setUserModalOpen(true);
          }}
        >
          Thêm nhân viên
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
            showTotal: (total) => `Tổng ${total} nhân viên`,
            onChange: (page, pageSize) => fetchUsers(page, pageSize),
          }}
        />
      </Card>

      {/* Create/Edit User Modal */}
      <Modal
        title={selectedUser ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
        open={userModalOpen}
        onCancel={() => {
          setUserModalOpen(false);
          setSelectedUser(null);
          userForm.resetFields();
        }}
        onOk={() => userForm.submit()}
        okText={selectedUser ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        width={500}
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
        title={`Phân vai trò cho: ${selectedUser?.fullName}`}
        open={roleModalOpen}
        onCancel={() => {
          setRoleModalOpen(false);
          setSelectedUser(null);
          roleForm.resetFields();
        }}
        onOk={() => roleForm.submit()}
        okText="Cập nhật"
        cancelText="Hủy"
        width={500}
      >
        <Form form={roleForm} layout="vertical" onFinish={handleRoleSubmit}>
          <Form.Item name="roleIds" label="Vai trò">
            <Select
              mode="multiple"
              placeholder="Chọn vai trò"
              options={roles.map((role) => ({
                value: role.id,
                label: (
                  <Space>
                    <Tag color={role.code === 'ADMIN' ? 'red' : 'blue'}>{role.code}</Tag>
                    {role.name}
                  </Space>
                ),
              }))}
            />
          </Form.Item>
          <Divider />
          <Text type="secondary">
            Mỗi vai trò có các quyền đã được định nghĩa sẵn.
            Admin có thể chỉnh sửa quyền của vai trò tại Cài đặt → Vai trò.
          </Text>
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
