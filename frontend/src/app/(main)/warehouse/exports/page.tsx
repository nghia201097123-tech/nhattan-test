'use client';

import { useState } from 'react';
import { Card, Table, Button, Space, Input, Typography, Tooltip, Tag } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, CheckOutlined } from '@ant-design/icons';

const { Title } = Typography;

const statusColors: Record<string, string> = {
  DRAFT: 'default',
  PENDING_APPROVAL: 'processing',
  APPROVED: 'success',
  REJECTED: 'error',
  EXPORTED: 'cyan',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Nháp',
  PENDING_APPROVAL: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  EXPORTED: 'Đã xuất',
};

export default function WarehouseExportsPage() {
  const [search, setSearch] = useState('');

  const mockData = [
    {
      id: '1',
      exportCode: 'PX2024000001',
      warehouse: { name: 'Kho chính' },
      purpose: 'RESEARCH',
      status: 'PENDING_APPROVAL',
      requestDate: '2024-01-15',
      recipientName: 'Viện nghiên cứu A',
    },
  ];

  const columns = [
    { title: 'Số phiếu', dataIndex: 'exportCode', key: 'exportCode' },
    { title: 'Kho', dataIndex: ['warehouse', 'name'], key: 'warehouse' },
    { title: 'Mục đích', dataIndex: 'purpose', key: 'purpose' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (status: string) => <Tag color={statusColors[status]}>{statusLabels[status]}</Tag> },
    { title: 'Ngày yêu cầu', dataIndex: 'requestDate', key: 'requestDate' },
    { title: 'Người nhận', dataIndex: 'recipientName', key: 'recipientName' },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Xem"><Button type="text" size="small" icon={<EyeOutlined />} /></Tooltip>
          {record.status === 'PENDING_APPROVAL' && (
            <Tooltip title="Duyệt"><Button type="text" size="small" icon={<CheckOutlined />} /></Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Phiếu xuất kho</Title>
        <Button type="primary" icon={<PlusOutlined />}>Tạo phiếu xuất</Button>
      </div>
      <Card>
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined />}
          style={{ width: 300, marginBottom: 16 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Table dataSource={mockData} columns={columns} rowKey="id" />
      </Card>
    </div>
  );
}
