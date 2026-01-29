'use client';

import { Card, Row, Col, Statistic, Table, Typography } from 'antd';
import {
  ExperimentOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

export default function DashboardPage() {
  const stats = [
    {
      title: 'T\u1ED5ng s\u1ED1 m\u1EABu',
      value: 1234,
      icon: <ExperimentOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      color: '#e6f7ff',
    },
    {
      title: 'M\u1EABu trong kho',
      value: 890,
      icon: <DatabaseOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      color: '#f6ffed',
    },
    {
      title: '\u0110\u00E3 \u0111\u00E1nh gi\u00E1',
      value: 567,
      icon: <CheckCircleOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
      color: '#f9f0ff',
    },
    {
      title: 'Ch\u1EDD \u0111\u00E1nh gi\u00E1',
      value: 45,
      icon: <ClockCircleOutlined style={{ fontSize: 24, color: '#fa8c16' }} />,
      color: '#fff7e6',
    },
  ];

  const recentSamples = [
    {
      key: '1',
      code: 'SM2024000001',
      name: 'L\u00FAa n\u1EBFp \u0111en',
      category: 'L\u00FAa',
      status: 'IN_STORAGE',
      date: '2024-01-15',
    },
    {
      key: '2',
      code: 'SM2024000002',
      name: 'Ng\u00F4 n\u1EBFp t\u00EDm',
      category: 'Ng\u00F4',
      status: 'EVALUATED',
      date: '2024-01-14',
    },
    {
      key: '3',
      code: 'SM2024000003',
      name: '\u0110\u1EADu t\u01B0\u01A1ng \u0111en',
      category: '\u0110\u1EADu',
      status: 'COLLECTED',
      date: '2024-01-13',
    },
  ];

  const columns = [
    { title: 'M\u00E3 m\u1EABu', dataIndex: 'code', key: 'code' },
    { title: 'T\u00EAn m\u1EABu', dataIndex: 'name', key: 'name' },
    { title: 'Nh\u00F3m', dataIndex: 'category', key: 'category' },
    { title: 'Tr\u1EA1ng th\u00E1i', dataIndex: 'status', key: 'status' },
    { title: 'Ng\u00E0y', dataIndex: 'date', key: 'date' },
  ];

  return (
    <div>
      <Title level={4}>Dashboard</Title>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card style={{ background: stat.color }}>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ marginTop: 24 }} title="M\u1EABu gi\u1ED1ng m\u1EDBi nh\u1EA5t">
        <Table
          dataSource={recentSamples}
          columns={columns}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
}
