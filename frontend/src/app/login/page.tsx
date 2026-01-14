'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/auth.store';

const { Title } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [form] = Form.useForm();

  const handleSubmit = async (values: { username: string; password: string }) => {
    try {
      await login(values.username, values.password);
      message.success('\u0110\u0103ng nh\u1EADp th\u00E0nh c\u00F4ng!');
      router.push('/dashboard');
    } catch (error: any) {
      message.error(error.response?.data?.message || '\u0110\u0103ng nh\u1EADp th\u1EA5t b\u1EA1i!');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3}>Seed Management System</Title>
          <p style={{ color: '#666' }}>H\u1EC7 th\u1ED1ng qu\u1EA3n l\u00FD m\u1EABu gi\u1ED1ng</p>
        </div>

        <Form form={form} onFinish={handleSubmit} layout="vertical" size="large">
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui l\u00F2ng nh\u1EADp t\u00EAn \u0111\u0103ng nh\u1EADp!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="T\u00EAn \u0111\u0103ng nh\u1EADp"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui l\u00F2ng nh\u1EADp m\u1EADt kh\u1EA9u!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="M\u1EADt kh\u1EA9u"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading} block>
              \u0110\u0103ng nh\u1EADp
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
