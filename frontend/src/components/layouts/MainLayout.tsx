'use client';

import React, { useEffect } from 'react';
import { Layout, Menu, Dropdown, Avatar, Space, Button } from 'antd';
import {
  DashboardOutlined,
  ExperimentOutlined,
  DatabaseOutlined,
  ImportOutlined,
  ExportOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/samples',
    icon: <ExperimentOutlined />,
    label: 'Qu\u1EA3n l\u00FD m\u1EABu gi\u1ED1ng',
    children: [
      { key: '/samples/collection', label: 'Thu th\u1EADp m\u1EABu' },
      { key: '/samples/evaluation', label: '\u0110\u00E1nh gi\u00E1 m\u1EABu' },
      { key: '/samples/list', label: 'Danh s\u00E1ch m\u1EABu' },
    ],
  },
  {
    key: '/warehouse',
    icon: <DatabaseOutlined />,
    label: 'Qu\u1EA3n l\u00FD kho',
    children: [
      { key: '/warehouse/receipts', icon: <ImportOutlined />, label: 'Phi\u1EBFu nh\u1EADp' },
      { key: '/warehouse/exports', icon: <ExportOutlined />, label: 'Phi\u1EBFu xu\u1EA5t' },
      { key: '/warehouse/inventory', label: 'T\u1ED3n kho' },
    ],
  },
  {
    key: '/catalog',
    icon: <AppstoreOutlined />,
    label: 'Danh m\u1EE5c',
    children: [
      { key: '/catalog/categories', label: 'Nh\u00F3m gi\u1ED1ng' },
      { key: '/catalog/varieties', label: 'Gi\u1ED1ng' },
      { key: '/catalog/warehouses', label: 'Kho' },
      { key: '/catalog/locations', label: 'V\u1ECB tr\u00ED l\u01B0u tr\u1EEF' },
      { key: '/catalog/providers', label: 'Ngu\u1ED3n cung c\u1EA5p' },
      { key: '/catalog/staff', label: 'Nh\u00E2n vi\u00EAn' },
    ],
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: 'C\u00E0i \u0111\u1EB7t',
    children: [
      { key: '/settings/users', label: 'Ng\u01B0\u1EDDi d\u00F9ng' },
      { key: '/settings/roles', label: 'Vai tr\u00F2' },
    ],
  },
];

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, loadUser } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Th\u00F4ng tin c\u00E1 nh\u00E2n',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '\u0110\u0103ng xu\u1EA5t',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        theme="dark"
        width={250}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: sidebarCollapsed ? 16 : 18,
            fontWeight: 'bold',
          }}
        >
          {sidebarCollapsed ? 'SMS' : 'Seed Management'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          defaultOpenKeys={['/samples', '/warehouse', '/catalog']}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 16px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}
        >
          <Button
            type="text"
            icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar}
            style={{ fontSize: 16 }}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.fullName || 'User'}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: 16,
            padding: 24,
            background: '#fff',
            borderRadius: 8,
            minHeight: 280,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
