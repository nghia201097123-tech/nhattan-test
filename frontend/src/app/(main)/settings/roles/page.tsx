'use client';

import { useState, useEffect } from 'react';
import { Card, Table, Tag, Typography, Collapse, Space, Badge } from 'antd';
import { SafetyOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { rolesService } from '@/services/users.service';
import { Role, Permission } from '@/types';

const { Title, Text } = Typography;
const { Panel } = Collapse;

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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

  const columns = [
    {
      title: 'Mã vai trò',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Tag color="blue">{code}</Tag>,
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
  ];

  return (
    <div>
      <Title level={4}>Quản lý vai trò & quyền hạn</Title>

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
    </div>
  );
}
