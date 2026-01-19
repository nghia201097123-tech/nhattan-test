'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Tree,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Typography,
  Empty,
  Tag,
  Progress,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { storageLocationsService, warehousesService } from '@/services/catalog.service';

const { Title } = Typography;

const locationTypes = [
  { value: 'CABINET', label: 'Tủ' },
  { value: 'SHELF', label: 'Kệ' },
  { value: 'COMPARTMENT', label: 'Ngăn' },
];

const statusColors: Record<string, string> = {
  EMPTY: 'green',
  PARTIAL: 'orange',
  FULL: 'red',
};

const statusLabels: Record<string, string> = {
  EMPTY: 'Trống',
  PARTIAL: 'Một phần',
  FULL: 'Đầy',
};

export default function StorageLocationsPage() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>();
  const [treeData, setTreeData] = useState<any[]>([]);
  const [flatData, setFlatData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchWarehouses = async () => {
    try {
      const result = await warehousesService.getAll();
      const data = Array.isArray(result) ? result : result.data || [];
      setWarehouses(data);
      if (data.length > 0 && !selectedWarehouse) {
        setSelectedWarehouse(data[0].id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchLocations = async () => {
    if (!selectedWarehouse) return;
    setLoading(true);
    try {
      // Get flat data for parent options and build tree locally
      const result = await storageLocationsService.getByWarehouse(selectedWarehouse);
      setFlatData(result);
      setTreeData(buildTree(result));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [selectedWarehouse]);

  const buildTree = (data: any[]): any[] => {
    const map = new Map();
    const roots: any[] = [];

    data.forEach((item) => {
      map.set(item.id, { ...item, key: item.id, title: item.name, children: [] });
    });

    data.forEach((item) => {
      const node = map.get(item.id);
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        warehouseId: selectedWarehouse,
        // Clear parentId for CABINET type
        parentId: values.type === 'CABINET' ? null : values.parentId,
      };
      if (editingItem) {
        await storageLocationsService.update(editingItem.id, payload);
        message.success('Cập nhật thành công');
      } else {
        await storageLocationsService.create(payload);
        message.success('Thêm mới thành công');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingItem(null);
      fetchLocations();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await storageLocationsService.delete(id);
      message.success('Xóa thành công');
      fetchLocations();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const getParentOptions = (type: string) => {
    if (type === 'CABINET') return [];
    if (type === 'SHELF') return flatData.filter((item) => item.type === 'CABINET');
    return flatData.filter((item) => item.type === 'SHELF');
  };

  const titleRender = (node: any) => {
    const usagePercent = node.capacity ? Math.round((node.currentUsage / node.capacity) * 100) : 0;
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span>
          <InboxOutlined style={{ marginRight: 8 }} />
          {node.name}
          <Tag style={{ marginLeft: 8 }}>{locationTypes.find((t) => t.value === node.type)?.label}</Tag>
          <Tag color={statusColors[node.status]}>{statusLabels[node.status]}</Tag>
          {node.capacity && (
            <span style={{ marginLeft: 8, fontSize: 12, color: '#666' }}>
              ({node.currentUsage}/{node.capacity})
            </span>
          )}
        </span>
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              setEditingItem(node);
              form.setFieldsValue(node);
              setModalOpen(true);
            }}
          />
          <Popconfirm
            title="Xác nhận xóa?"
            onConfirm={() => handleDelete(node.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </Space>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Vị trí lưu trữ</Title>
        <Space>
          <Select
            placeholder="Chọn kho"
            style={{ width: 250 }}
            value={selectedWarehouse}
            onChange={setSelectedWarehouse}
            options={warehouses.map((w) => ({ label: w.name, value: w.id }))}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={!selectedWarehouse}
            onClick={() => {
              setEditingItem(null);
              form.resetFields();
              setModalOpen(true);
            }}
          >
            Thêm vị trí
          </Button>
        </Space>
      </div>

      <Card loading={loading}>
        {treeData.length > 0 ? (
          <Tree
            treeData={treeData}
            titleRender={titleRender}
            defaultExpandAll
            blockNode
            style={{ padding: 16 }}
          />
        ) : (
          <Empty description={selectedWarehouse ? 'Chưa có vị trí lưu trữ' : 'Vui lòng chọn kho'} />
        )}
      </Card>

      <Modal
        title={editingItem ? 'Sửa vị trí' : 'Thêm vị trí'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingItem(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingItem ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="type"
            label="Loại vị trí"
            rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
          >
            <Select options={locationTypes} placeholder="Chọn loại" />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              const options = getParentOptions(type);
              const parentLabel = type === 'SHELF' ? 'Thuộc Tủ' : 'Thuộc Kệ';
              return type && type !== 'CABINET' ? (
                <Form.Item
                  name="parentId"
                  label={parentLabel}
                  rules={[{ required: true, message: `Vui lòng chọn ${type === 'SHELF' ? 'Tủ' : 'Kệ'}` }]}
                >
                  <Select
                    options={options.map((o) => ({ label: o.name, value: o.id }))}
                    placeholder={`Chọn ${type === 'SHELF' ? 'Tủ' : 'Kệ'}`}
                  />
                </Form.Item>
              ) : null;
            }}
          </Form.Item>
          <Form.Item
            name="code"
            label="Mã vị trí"
            rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
          >
            <Input placeholder="VD: TU01, KE01-01" />
          </Form.Item>
          <Form.Item
            name="name"
            label="Tên vị trí"
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
          >
            <Input placeholder="Tên vị trí" />
          </Form.Item>
          <Form.Item name="capacity" label="Sức chứa">
            <Input type="number" placeholder="Số lượng mẫu tối đa" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
