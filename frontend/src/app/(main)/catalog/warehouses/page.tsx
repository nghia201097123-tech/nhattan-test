'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Typography,
  Modal,
  Form,
  InputNumber,
  message,
  Popconfirm,
  Tag,
  Progress,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { warehousesService } from '@/services/catalog.service';

const { Title } = Typography;
const { TextArea } = Input;

export default function WarehousesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await warehousesService.getAll();
      // Handle both array and paginated response
      const items = Array.isArray(result) ? result : (result.data || []);
      setData(items);
    } catch (error) {
      message.error('Không thể tải danh sách kho');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      if (editingItem) {
        await warehousesService.update(editingItem.id, values);
        message.success('Cập nhật kho thành công');
      } else {
        await warehousesService.create(values);
        message.success('Thêm kho thành công');
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
      await warehousesService.delete(id);
      message.success('Xóa kho thành công');
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const filteredData = data.filter((item) => {
    const searchLower = searchText.toLowerCase();
    return (
      !searchText ||
      item.name?.toLowerCase().includes(searchLower) ||
      item.code?.toLowerCase().includes(searchLower) ||
      item.location?.toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    { title: 'Mã kho', dataIndex: 'code', key: 'code', width: 120 },
    { title: 'Tên kho', dataIndex: 'name', key: 'name' },
    { title: 'Địa chỉ', dataIndex: 'location', key: 'location' },
    {
      title: 'Sức chứa',
      key: 'capacity',
      width: 200,
      render: (_: any, record: any) => {
        if (!record.maxCapacity) return '-';
        const percent = Math.round((record.currentUsage / record.maxCapacity) * 100);
        return (
          <div>
            <Progress
              percent={percent}
              size="small"
              status={percent > 90 ? 'exception' : percent > 70 ? 'active' : 'normal'}
            />
            <span style={{ fontSize: 12, color: '#666' }}>
              {record.currentUsage || 0} / {record.maxCapacity}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Nhiệt độ',
      dataIndex: 'storageTemp',
      key: 'storageTemp',
      render: (val: number) => (val ? `${val}°C` : '-'),
    },
    {
      title: 'Độ ẩm',
      dataIndex: 'humidityRange',
      key: 'humidityRange',
      render: (val: string) => val || '-',
    },
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
            description="Kho đang có vị trí lưu trữ sẽ không thể xóa"
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
        <Title level={4}>Danh mục kho</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingItem(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          Thêm kho
        </Button>
      </div>

      <Card>
        <Input
          placeholder="Tìm kiếm theo tên, mã, địa chỉ..."
          prefix={<SearchOutlined />}
          style={{ width: 300, marginBottom: 16 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingItem ? 'Sửa kho' : 'Thêm kho mới'}
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
              label="Mã kho"
              rules={[{ required: true, message: 'Vui lòng nhập mã kho' }]}
            >
              <Input placeholder="VD: KHO001" />
            </Form.Item>
            <Form.Item
              name="name"
              label="Tên kho"
              rules={[{ required: true, message: 'Vui lòng nhập tên kho' }]}
            >
              <Input placeholder="Tên kho" />
            </Form.Item>
          </div>

          <Form.Item name="location" label="Địa chỉ">
            <Input placeholder="Địa chỉ kho" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item name="maxCapacity" label="Sức chứa tối đa">
              <InputNumber style={{ width: '100%' }} placeholder="Số lượng" min={0} />
            </Form.Item>
            <Form.Item name="storageTemp" label="Nhiệt độ bảo quản (°C)">
              <InputNumber style={{ width: '100%' }} placeholder="VD: 25" />
            </Form.Item>
            <Form.Item name="humidityRange" label="Độ ẩm">
              <Input placeholder="VD: 40-60%" />
            </Form.Item>
          </div>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả về kho" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
