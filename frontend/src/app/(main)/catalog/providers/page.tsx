'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Select,
  message,
  Popconfirm,
  Tag,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { sampleProvidersService } from '@/services/catalog.service';

const { Title } = Typography;
const { TextArea } = Input;

const providerTypes = [
  { value: 'GENE_BANK', label: 'Ngân hàng gen', color: 'purple' },
  { value: 'INSTITUTE', label: 'Viện nghiên cứu', color: 'blue' },
  { value: 'ORGANIZATION', label: 'Tổ chức', color: 'cyan' },
  { value: 'INDIVIDUAL', label: 'Cá nhân', color: 'green' },
];

export default function ProvidersPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<string>();
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await sampleProvidersService.getAll({ type: selectedType } as any);
      setData(Array.isArray(result) ? result : result.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedType]);

  const handleSubmit = async (values: any) => {
    try {
      if (editingItem) {
        await sampleProvidersService.update(editingItem.id, values);
        message.success('Cập nhật thành công');
      } else {
        await sampleProvidersService.create(values);
        message.success('Thêm mới thành công');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingItem(null);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await sampleProvidersService.delete(id);
      message.success('Xóa thành công');
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const filteredData = data.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { title: 'Mã', dataIndex: 'code', key: 'code', width: 100 },
    { title: 'Tên nơi cung cấp', dataIndex: 'name', key: 'name' },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const t = providerTypes.find((p) => p.value === type);
        return t ? <Tag color={t.color}>{t.label}</Tag> : type;
      },
    },
    { title: 'Người liên hệ', dataIndex: 'contactPerson', key: 'contactPerson' },
    { title: 'Điện thoại', dataIndex: 'phone', key: 'phone' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (val: boolean) => (
        <Tag color={val ? 'green' : 'red'}>{val ? 'Hoạt động' : 'Ngừng'}</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingItem(record);
              form.setFieldsValue(record);
              setModalOpen(true);
            }}
          />
          <Popconfirm
            title="Xác nhận xóa?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Nơi cung cấp mẫu</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingItem(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          Thêm nơi cung cấp
        </Button>
      </div>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Lọc theo loại"
            allowClear
            style={{ width: 200 }}
            value={selectedType}
            onChange={setSelectedType}
            options={providerTypes}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingItem ? 'Sửa nơi cung cấp' : 'Thêm nơi cung cấp'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingItem(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingItem ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="code"
              label="Mã"
              rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
            >
              <Input placeholder="Mã nơi cung cấp" />
            </Form.Item>
            <Form.Item
              name="type"
              label="Loại"
              rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
            >
              <Select options={providerTypes} placeholder="Chọn loại" />
            </Form.Item>
          </div>
          <Form.Item
            name="name"
            label="Tên nơi cung cấp"
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
          >
            <Input placeholder="Tên nơi cung cấp" />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <TextArea rows={2} placeholder="Địa chỉ" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item name="contactPerson" label="Người liên hệ">
              <Input placeholder="Họ tên" />
            </Form.Item>
            <Form.Item name="phone" label="Điện thoại">
              <Input placeholder="Số điện thoại" />
            </Form.Item>
            <Form.Item name="email" label="Email">
              <Input placeholder="Email" />
            </Form.Item>
          </div>
          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={2} placeholder="Ghi chú" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
