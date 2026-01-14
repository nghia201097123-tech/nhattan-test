'use client';

import { useState } from 'react';
import { Card, Table, Button, Input, Typography, Select, Row, Col } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function InventoryPage() {
  const [search, setSearch] = useState('');

  const mockData = [
    {
      id: '1',
      sampleCode: 'SM2024000001',
      sampleName: 'Lúa nếp đen',
      warehouseName: 'Kho chính',
      storageName: 'Tủ A1 - Ngăn 1',
      totalIn: 500,
      totalOut: 100,
      currentStock: 400,
      unit: 'gram',
    },
    {
      id: '2',
      sampleCode: 'SM2024000002',
      sampleName: 'Ngô nếp tím',
      warehouseName: 'Kho chính',
      storageName: 'Tủ A2 - Ngăn 2',
      totalIn: 300,
      totalOut: 50,
      currentStock: 250,
      unit: 'gram',
    },
  ];

  const columns = [
    { title: 'Mã mẫu', dataIndex: 'sampleCode', key: 'sampleCode' },
    { title: 'Tên mẫu', dataIndex: 'sampleName', key: 'sampleName' },
    { title: 'Kho', dataIndex: 'warehouseName', key: 'warehouseName' },
    { title: 'Vị trí', dataIndex: 'storageName', key: 'storageName' },
    { title: 'Tổng nhập', dataIndex: 'totalIn', key: 'totalIn' },
    { title: 'Tổng xuất', dataIndex: 'totalOut', key: 'totalOut' },
    { title: 'Tồn kho', dataIndex: 'currentStock', key: 'currentStock',
      render: (val: number, record: any) => <strong>{val} {record.unit}</strong> },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Tồn kho</Title>
        <Button icon={<DownloadOutlined />}>Xuất Excel</Button>
      </div>
      <Card>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Input
              placeholder="Tìm kiếm mẫu..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
          <Col span={8}>
            <Select placeholder="Chọn kho" style={{ width: '100%' }} allowClear>
              <Select.Option value="1">Kho chính</Select.Option>
              <Select.Option value="2">Kho phụ</Select.Option>
            </Select>
          </Col>
        </Row>
        <Table dataSource={mockData} columns={columns} rowKey="id" />
      </Card>
    </div>
  );
}
