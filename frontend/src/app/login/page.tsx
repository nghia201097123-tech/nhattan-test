'use client';

import { useRouter } from 'next/navigation';
import { Form, Input, Button, Card, message, Typography, Space, Dropdown } from 'antd';
import { UserOutlined, LockOutlined, GlobalOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/auth.store';
import { useLanguageStore } from '@/store/language.store';

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const { t, language, setLanguage } = useLanguageStore();
  const [form] = Form.useForm();

  const handleSubmit = async (values: { username: string; password: string }) => {
    try {
      await login(values.username, values.password);
      message.success(t.auth.loginSuccess);
      router.push('/dashboard');
    } catch (error: any) {
      message.error(error.response?.data?.message || t.auth.loginFailed);
    }
  };

  const languageItems = [
    {
      key: 'vi',
      label: '🇻🇳 Tiếng Việt',
      onClick: () => setLanguage('vi'),
    },
    {
      key: 'en',
      label: '🇬🇧 English',
      onClick: () => setLanguage('en'),
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
        position: 'relative',
      }}
    >
      {/* Language Switcher */}
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <Dropdown menu={{ items: languageItems }} placement="bottomRight">
          <Button
            type="text"
            icon={<GlobalOutlined />}
            style={{ color: 'white', fontSize: 16 }}
          >
            {language === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}
          </Button>
        </Dropdown>
      </div>

      <Card
        style={{
          width: 420,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          borderRadius: 12,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 80,
              height: 80,
              margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 36, color: 'white' }}>🌱</span>
          </div>
          <Title level={2} style={{ marginBottom: 8, color: '#1890ff' }}>
            {t.app.name}
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            {t.app.description}
          </Text>
        </div>

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
          requiredMark={false}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: t.auth.usernameRequired }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
              placeholder={t.auth.username}
              autoComplete="username"
              style={{ borderRadius: 8, height: 48 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: t.auth.passwordRequired }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder={t.auth.password}
              autoComplete="current-password"
              style={{ borderRadius: 8, height: 48 }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16, marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
              style={{
                height: 48,
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 500,
              }}
            >
              {t.auth.login}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            © 2024 SeedVault. All rights reserved.
          </Text>
        </div>
      </Card>
    </div>
  );
}
