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
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { locationsService } from '@/services/catalog.service';

const { Title } = Typography;

const levelOptions = [
  { value: 1, label: 'Tỉnh/Thành phố' },
  { value: 2, label: 'Quận/Huyện' },
  { value: 3, label: 'Phường/Xã' },
];

export default function LocationsPage() {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [flatData, setFlatData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await locationsService.getTree();
      setFlatData(result);
      setTreeData(buildTree(result));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      if (editingItem) {
        await locationsService.update(editingItem.id, values);
        message.success('Cập nhật thành công');
      } else {
        await locationsService.create(values);
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
      await locationsService.delete(id);
      message.success('Xóa thành công');
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const getParentOptions = (level: number) => {
    if (level === 1) return [];
    return flatData
      .filter((item) => item.level === level - 1)
      .map((item) => ({ label: item.name, value: item.id }));
  };

  const titleRender = (node: any) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <span>
        <EnvironmentOutlined style={{ marginRight: 8 }} />
        {node.name} <span style={{ color: '#999', fontSize: 12 }}>({node.code})</span>
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Danh mục địa phương</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingItem(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          Thêm địa phương
        </Button>
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
          <Empty description="Chưa có dữ liệu địa phương" />
        )}
      </Card>

      <Modal
        title={editingItem ? 'Sửa địa phương' : 'Thêm địa phương'}
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
            name="level"
            label="Cấp hành chính"
            rules={[{ required: true, message: 'Vui lòng chọn cấp' }]}
          >
            <Select options={levelOptions} placeholder="Chọn cấp" />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.level !== cur.level}>
            {({ getFieldValue }) => {
              const level = getFieldValue('level');
              const options = getParentOptions(level);
              return level > 1 ? (
                <Form.Item name="parentId" label="Thuộc về">
                  <Select options={options} placeholder="Chọn vị trí cha" allowClear />
                </Form.Item>
              ) : null;
            }}
          </Form.Item>
          <Form.Item
            name="code"
            label="Mã địa phương"
            rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
          >
            <Input placeholder="VD: HN, HCM" />
          </Form.Item>
          <Form.Item
            name="name"
            label="Tên địa phương"
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
          >
            <Input placeholder="Tên địa phương" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
