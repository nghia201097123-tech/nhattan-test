'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Tag,
  Typography,
  Tooltip,
  Modal,
  message,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title } = Typography;

const statusColors: Record<string, string> = {
  COLLECTED: 'blue',
  PROCESSING: 'orange',
  EVALUATED: 'purple',
  IN_STORAGE: 'green',
  EXPORTED: 'cyan',
  DESTROYED: 'red',
};

const statusLabels: Record<string, string> = {
  COLLECTED: 'Đã thu thập',
  PROCESSING: 'Đang xử lý',
  EVALUATED: 'Đã đánh giá',
  IN_STORAGE: 'Trong kho',
  EXPORTED: 'Đã xuất',
  DESTROYED: 'Đã huỷ',
};

export default function SamplesListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const mockData = [
    {
      id: '1',
      sampleCode: 'SM2024000001',
      sampleName: 'Lúa nếp đen',
      category: { name: 'Lúa' },
      variety: { name: 'Nếp cẩm' },
      quantity: 500,
      unit: 'gram',
      status: 'IN_STORAGE',
      lastGerminationRate: 95,
    },
    {
      id: '2',
      sampleCode: 'SM2024000002',
      sampleName: 'Ngô nếp tím',
      category: { name: 'Ngô' },
      variety: { name: 'Ngô nếp' },
      quantity: 300,
      unit: 'gram',
      status: 'EVALUATED',
      lastGerminationRate: 88,
    },
  ];

  const columns = [
    {
      title: 'Mã mẫu',
      dataIndex: 'sampleCode',
      key: 'sampleCode',
      width: 140,
    },
    {
      title: 'Tên mẫu',
      dataIndex: 'sampleName',
      key: 'sampleName',
    },
    {
      title: 'Nhóm giống',
      dataIndex: ['category', 'name'],
      key: 'category',
    },
    {
      title: 'Giống',
      dataIndex: ['variety', 'name'],
      key: 'variety',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (val: number, record: any) => `${val} ${record.unit}`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: 'Nảy mầm',
      dataIndex: 'lastGerminationRate',
      key: 'lastGerminationRate',
      render: (val: number) => (val ? `${val}%` : '-'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Xem">
            <Button type="text" size="small" icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button type="text" size="small" icon={<EditOutlined />} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Danh sách mẫu giống</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push('/samples/collection')}
        >
          Thêm mẫu mới
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm theo mã hoặc tên mẫu..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
        </div>

        <Table
          dataSource={mockData}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            total: 2,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} mẫu`,
          }}
        />
      </Card>
    </div>
  );
}
