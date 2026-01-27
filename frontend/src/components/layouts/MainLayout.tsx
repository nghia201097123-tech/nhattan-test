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
  GlobalOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { useLanguageStore } from '@/store/language.store';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, loadUser } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { t, language, setLanguage } = useLanguageStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: t.menu.dashboard,
    },
    {
      key: '/samples',
      icon: <ExperimentOutlined />,
      label: t.menu.samples,
      children: [
        { key: '/samples/collection', label: t.menu.sampleCollection },
        { key: '/samples/evaluation', label: t.menu.sampleEvaluation },
        { key: '/samples/propagation', label: t.menu.samplePropagation },
        { key: '/samples/seed-card', label: t.menu.seedCard },
        { key: '/samples/list', label: t.menu.sampleList },
      ],
    },
    {
      key: '/warehouse',
      icon: <DatabaseOutlined />,
      label: t.menu.warehouse,
      children: [
        { key: '/warehouse/receipts', icon: <ImportOutlined />, label: t.menu.receipts },
        { key: '/warehouse/exports', icon: <ExportOutlined />, label: t.menu.exports },
        { key: '/warehouse/inventory', label: t.menu.inventory },
      ],
    },
    {
      key: '/catalog',
      icon: <AppstoreOutlined />,
      label: t.menu.catalog,
      children: [
        { key: '/catalog/categories', label: t.menu.categories },
        { key: '/catalog/varieties', label: t.menu.varieties },
        { key: '/catalog/warehouses', label: t.menu.warehouses },
        { key: '/catalog/storage-locations', label: 'Vị trí lưu trữ' },
        { key: '/catalog/locations', label: t.menu.locations },
        { key: '/catalog/providers', label: t.menu.providers },
        { key: '/catalog/staff', label: t.menu.staff },
        { key: '/catalog/evaluation-criteria', label: 'Tiêu chuẩn đánh giá' },
        { key: '/catalog/export-reasons', label: 'Lý do xuất kho' },
        { key: '/catalog/category-groups', label: 'Danh mục khác' },
      ],
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: t.menu.settings,
      children: [
        { key: '/settings/roles', label: t.menu.roles },
      ],
    },
  ];

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
      label: t.common.profile,
      onClick: () => router.push('/profile'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t.auth.logout,
      onClick: handleLogout,
    },
  ];

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
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        theme="dark"
        width={260}
        style={{
          background: 'linear-gradient(180deg, #001529 0%, #002140 100%)',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <span style={{ fontSize: 24, marginRight: sidebarCollapsed ? 0 : 8 }}>🌱</span>
          {!sidebarCollapsed && (
            <span
              style={{
                color: 'white',
                fontSize: 18,
                fontWeight: 'bold',
              }}
            >
              {t.app.name}
            </span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          defaultOpenKeys={['/samples', '/warehouse', '/catalog']}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ background: 'transparent', borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <Button
            type="text"
            icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar}
            style={{ fontSize: 18 }}
          />
          <Space size="middle">
            {/* Language Switcher */}
            <Dropdown menu={{ items: languageItems }} placement="bottomRight">
              <Button type="text" icon={<GlobalOutlined />}>
                {language === 'vi' ? 'VI' : 'EN'}
              </Button>
            </Dropdown>

            {/* User Menu */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  icon={<UserOutlined />}
                  style={{ background: '#1890ff' }}
                />
                <span style={{ fontWeight: 500 }}>{user?.fullName || 'User'}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: '#fff',
            borderRadius: 8,
            minHeight: 280,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
