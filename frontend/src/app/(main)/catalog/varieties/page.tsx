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
import { seedVarietiesService, seedCategoriesService } from '@/services/catalog.service';

const { Title } = Typography;
const { TextArea } = Input;

export default function VarietiesPage() {
  const [data, setData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await seedVarietiesService.getAll({ categoryId: selectedCategory } as any);
      setData(Array.isArray(result) ? result : result.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await seedCategoriesService.getAll();
      setCategories(result);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const handleSubmit = async (values: any) => {
    try {
      if (editingItem) {
        await seedVarietiesService.update(editingItem.id, values);
        message.success('Cập nhật thành công');
      } else {
        await seedVarietiesService.create(values);
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
      await seedVarietiesService.delete(id);
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
    { title: 'Mã giống', dataIndex: 'code', key: 'code', width: 120 },
    { title: 'Tên giống', dataIndex: 'name', key: 'name' },
    { title: 'Tên khoa học', dataIndex: 'scientificName', key: 'scientificName' },
    { title: 'Xuất xứ', dataIndex: 'origin', key: 'origin' },
    {
      title: 'Nhóm giống',
      dataIndex: 'category',
      key: 'category',
      render: (cat: any) => cat?.name || '-',
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
        <Title level={4}>Danh mục giống</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingItem(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          Thêm giống
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
            placeholder="Lọc theo nhóm"
            allowClear
            style={{ width: 200 }}
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
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
        title={editingItem ? 'Sửa giống' : 'Thêm giống mới'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingItem(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingItem ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="code"
              label="Mã giống"
              rules={[{ required: true, message: 'Vui lòng nhập mã giống' }]}
            >
              <Input placeholder="VD: LUA001" />
            </Form.Item>
            <Form.Item
              name="categoryId"
              label="Nhóm giống"
              rules={[{ required: true, message: 'Vui lòng chọn nhóm' }]}
            >
              <Select
                placeholder="Chọn nhóm"
                options={categories.map((c) => ({ label: c.name, value: c.id }))}
              />
            </Form.Item>
          </div>
          <Form.Item
            name="name"
            label="Tên giống"
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
          >
            <Input placeholder="Tên giống cây" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="scientificName" label="Tên khoa học">
              <Input placeholder="Tên khoa học" />
            </Form.Item>
            <Form.Item name="localName" label="Tên địa phương">
              <Input placeholder="Tên địa phương" />
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="origin" label="Xuất xứ">
              <Input placeholder="Xuất xứ" />
            </Form.Item>
            <Form.Item name="growthDuration" label="Thời gian sinh trưởng">
              <Input placeholder="VD: 90-100 ngày" />
            </Form.Item>
          </div>
          <Form.Item name="characteristics" label="Đặc điểm">
            <TextArea rows={2} placeholder="Đặc điểm của giống" />
          </Form.Item>
          <Form.Item name="yieldPotential" label="Năng suất tiềm năng">
            <Input placeholder="VD: 6-8 tấn/ha" />
          </Form.Item>
          <Form.Item name="diseaseResistance" label="Khả năng chống bệnh">
            <TextArea rows={2} placeholder="Khả năng kháng bệnh" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
