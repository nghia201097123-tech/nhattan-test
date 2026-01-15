'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Tree,
  Button,
  Typography,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tag,
  Descriptions,
  Empty,
  Spin,
  Switch,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  FileOutlined,
  InfoCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { seedCategoriesService } from '@/services/catalog.service';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface SeedCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  level: number;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  children?: SeedCategory[];
  createdAt?: string;
  updatedAt?: string;
}

export default function CategoriesPage() {
  const [data, setData] = useState<SeedCategory[]>([]);
  const [flatData, setFlatData] = useState<SeedCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SeedCategory | null>(null);
  const [selectedItem, setSelectedItem] = useState<SeedCategory | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [treeResult, allResult] = await Promise.all([
        seedCategoriesService.getTree(),
        seedCategoriesService.getAll(),
      ]);
      setData(treeResult);
      setFlatData(allResult);
    } catch (error) {
      console.error(error);
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const buildTreeData = (items: SeedCategory[]): any[] => {
    return items.map((item) => ({
      ...item,
      key: item.id,
      title: item.name,
      children: item.children ? buildTreeData(item.children) : [],
    }));
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingItem) {
        await seedCategoriesService.update(editingItem.id, values);
        message.success('Cập nhật thành công');
      } else {
        await seedCategoriesService.create(values);
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
      await seedCategoriesService.delete(id);
      message.success('Xóa thành công');
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể xóa (có thể đang có dữ liệu con)');
    }
  };

  const openAddModal = (parentId?: string) => {
    setEditingItem(null);
    form.resetFields();
    if (parentId) {
      form.setFieldsValue({ parentId });
    }
    setModalOpen(true);
  };

  const openEditModal = (item: SeedCategory) => {
    setEditingItem(item);
    form.setFieldsValue({
      code: item.code,
      name: item.name,
      description: item.description,
      parentId: item.parentId,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setModalOpen(true);
  };

  const openDetailModal = (item: SeedCategory) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  };

  const getParentOptions = () => {
    return flatData
      .filter((item) => !editingItem || item.id !== editingItem.id)
      .map((item) => ({
        label: `${'—'.repeat(item.level - 1)} ${item.name}`,
        value: item.id,
      }));
  };

  const titleRender = (node: any) => {
    const hasChildren = node.children && node.children.length > 0;
    const item = node as SeedCategory;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 0',
          minWidth: 400,
        }}
      >
        <Space>
          {hasChildren ? (
            <FolderOutlined style={{ color: '#1890ff' }} />
          ) : (
            <FileOutlined style={{ color: '#52c41a' }} />
          )}
          <span style={{ fontWeight: hasChildren ? 600 : 400 }}>{item.name}</span>
          <Text type="secondary" style={{ fontSize: 12 }}>
            ({item.code})
          </Text>
          {!item.isActive && <Tag color="red">Ngừng</Tag>}
        </Space>

        <Space size="small" onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => openDetailModal(item)}
            />
          </Tooltip>
          <Tooltip title="Thêm nhóm con">
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              style={{ color: '#52c41a' }}
              onClick={() => openAddModal(item.id)}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditModal(item)}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa?"
            description="Nhóm con (nếu có) cũng sẽ bị xóa"
            onConfirm={() => handleDelete(item.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      </div>
    );
  };

  const treeData = buildTreeData(data);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Danh mục nhóm giống</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openAddModal()}>
          Thêm nhóm gốc
        </Button>
      </div>

      <Card>
        <Spin spinning={loading}>
          {treeData.length > 0 ? (
            <Tree
              showLine={{ showLeafIcon: false }}
              defaultExpandAll
              blockNode
              treeData={treeData}
              titleRender={titleRender}
              style={{ padding: 16 }}
            />
          ) : (
            <Empty description="Chưa có nhóm giống nào" />
          )}
        </Spin>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={
          <Space>
            {editingItem ? <EditOutlined /> : <PlusOutlined />}
            {editingItem ? 'Sửa nhóm giống' : 'Thêm nhóm giống'}
          </Space>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingItem(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingItem ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ isActive: true, sortOrder: 0 }}>
          <Form.Item
            name="code"
            label="Mã nhóm"
            rules={[
              { required: true, message: 'Vui lòng nhập mã nhóm' },
              { pattern: /^[A-Z0-9_]+$/, message: 'Mã chỉ gồm chữ in hoa, số và dấu _' },
            ]}
          >
            <Input placeholder="VD: LUA, NGO, DAU" style={{ textTransform: 'uppercase' }} />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên nhóm"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhóm' }]}
          >
            <Input placeholder="Tên nhóm giống" />
          </Form.Item>

          <Form.Item name="parentId" label="Nhóm cha">
            <Select
              allowClear
              placeholder="Chọn nhóm cha (để trống nếu là nhóm gốc)"
              options={getParentOptions()}
              showSearch
              filterOption={(input, option) =>
                (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả chi tiết về nhóm giống" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="sortOrder" label="Thứ tự sắp xếp">
              <Input type="number" min={0} placeholder="0" />
            </Form.Item>

            <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
              <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngừng" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <InfoCircleOutlined />
            Chi tiết nhóm giống
          </Space>
        }
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedItem(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Đóng
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setDetailModalOpen(false);
              if (selectedItem) openEditModal(selectedItem);
            }}
          >
            Sửa
          </Button>,
        ]}
        width={600}
      >
        {selectedItem && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Mã nhóm" span={1}>
              <Tag color="blue">{selectedItem.code}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" span={1}>
              <Tag color={selectedItem.isActive ? 'green' : 'red'}>
                {selectedItem.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tên nhóm" span={2}>
              <strong>{selectedItem.name}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Cấp độ" span={1}>
              Cấp {selectedItem.level}
            </Descriptions.Item>
            <Descriptions.Item label="Thứ tự" span={1}>
              {selectedItem.sortOrder}
            </Descriptions.Item>
            <Descriptions.Item label="Nhóm cha" span={2}>
              {selectedItem.parentId
                ? flatData.find((f) => f.id === selectedItem.parentId)?.name || '-'
                : <Text type="secondary">(Nhóm gốc)</Text>}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả" span={2}>
              {selectedItem.description || <Text type="secondary">Chưa có mô tả</Text>}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo" span={1}>
              {selectedItem.createdAt
                ? new Date(selectedItem.createdAt).toLocaleDateString('vi-VN')
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối" span={1}>
              {selectedItem.updatedAt
                ? new Date(selectedItem.updatedAt).toLocaleDateString('vi-VN')
                : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
