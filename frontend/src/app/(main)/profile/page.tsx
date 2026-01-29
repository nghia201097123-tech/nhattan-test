'use client';

import { Card, Descriptions, Avatar, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/auth.store';

const { Title } = Typography;

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div>
      <Title level={4}>Thông tin cá nhân</Title>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Avatar size={100} icon={<UserOutlined />} style={{ background: '#1890ff' }} />
          <Title level={4} style={{ marginTop: 16, marginBottom: 0 }}>{user?.fullName}</Title>
          <p style={{ color: '#666' }}>{user?.email}</p>
        </div>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Tên đăng nhập">{user?.username}</Descriptions.Item>
          <Descriptions.Item label="Họ và tên">{user?.fullName}</Descriptions.Item>
          <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{user?.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">{user?.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
