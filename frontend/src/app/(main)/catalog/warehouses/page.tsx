'use client';

import { useState } from 'react';
import { Card, Table, Button, Space, Input, Typography, Tooltip, Modal, Form, InputNumber } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function WarehousesPage() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const mockData = [
    {
      id: '1',
      code: 'KHO001',
      name: 'Kho chính',
      address: 'Hà Nội',
      capacity: 10000,
      temperatureMin: 15,
      temperatureMax: 25,
      humidityMin: 40,
      humidityMax: 60,
    },
  ];

  const columns = [
    { title: 'Mã kho', dataIndex: 'code', key: 'code' },
    { title: 'Tên kho', dataIndex: 'name', key: 'name' },
    { title: 'Địa chỉ', dataIndex: 'address', key: 'address' },
    { title: 'Sức chứa', dataIndex: 'capacity', key: 'capacity' },
    { title: 'Nhiệt độ', key: 'temp', render: (_: any, r: any) => `${r.temperatureMin}-${r.temperatureMax}°C` },
    { title: 'Độ ẩm', key: 'humidity', render: (_: any, r: any) => `${r.humidityMin}-${r.humidityMax}%` },
    {
      title: 'Thao tác',
      key: 'actions',
      render: () => (
        <Space>
          <Tooltip title="Sửa"><Button type="text" size="small" icon={<EditOutlined />} /></Tooltip>
          <Tooltip title="Xóa"><Button type="text" size="small" danger icon={<DeleteOutlined />} /></Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Danh mục kho</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Thêm kho</Button>
      </div>
      <Card>
        <Input placeholder="Tìm kiếm..." prefix={<SearchOutlined />} style={{ width: 300, marginBottom: 16 }}
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <Table dataSource={mockData} columns={columns} rowKey="id" />
      </Card>

      <Modal title="Thêm kho" open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => form.submit()} width={600}>
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Mã kho" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="name" label="Tên kho" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="address" label="Địa chỉ"><Input /></Form.Item>
          <Form.Item name="capacity" label="Sức chứa"><InputNumber style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
