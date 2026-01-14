'use client';

import { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Typography,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title } = Typography;

export default function WarehouseReceiptsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const mockData = [
    {
      id: '1',
      receiptCode: 'PN2024000001',
      warehouse: { name: 'Kho chính' },
      receiptDate: '2024-01-15',
      receiver: { fullName: 'Nguyễn Văn A' },
      items: [1, 2, 3],
      createdAt: '2024-01-15T10:00:00',
    },
  ];

  const columns = [
    { title: 'Số phiếu', dataIndex: 'receiptCode', key: 'receiptCode' },
    { title: 'Kho', dataIndex: ['warehouse', 'name'], key: 'warehouse' },
    { title: 'Ngày nhập', dataIndex: 'receiptDate', key: 'receiptDate' },
    { title: 'Người nhận', dataIndex: ['receiver', 'fullName'], key: 'receiver' },
    { title: 'Số mẫu', dataIndex: 'items', key: 'items', render: (items: any[]) => items?.length || 0 },
    {
      title: 'Thao tác',
      key: 'actions',
      render: () => (
        <Space>
          <Tooltip title="Xem"><Button type="text" size="small" icon={<EyeOutlined />} /></Tooltip>
          <Tooltip title="In"><Button type="text" size="small" icon={<PrinterOutlined />} /></Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Phiếu nhập kho</Title>
        <Button type="primary" icon={<PlusOutlined />}>Tạo phiếu nhập</Button>
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
