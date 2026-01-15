'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Tag,
  Typography,
  Collapse,
  List,
  Empty,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { categoryGroupsService, categoryItemsService } from '@/services/catalog.service';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

export default function CategoryGroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [groupForm] = Form.useForm();
  const [itemForm] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await categoryGroupsService.getAll();
      setGroups(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Group handlers
  const handleGroupSubmit = async (values: any) => {
    try {
      if (editingGroup) {
        await categoryGroupsService.update(editingGroup.id, values);
        message.success('Cập nhật thành công');
      } else {
        await categoryGroupsService.create(values);
        message.success('Thêm mới thành công');
      }
      setGroupModalOpen(false);
      groupForm.resetFields();
      setEditingGroup(null);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleGroupDelete = async (id: string) => {
    try {
      await categoryGroupsService.delete(id);
      message.success('Xóa thành công');
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Item handlers
  const handleItemSubmit = async (values: any) => {
    try {
      const payload = { ...values, groupId: selectedGroup.id };
      if (editingItem) {
        await categoryItemsService.update(editingItem.id, payload);
        message.success('Cập nhật thành công');
      } else {
        await categoryItemsService.create(payload);
        message.success('Thêm mới thành công');
      }
      setItemModalOpen(false);
      itemForm.resetFields();
      setEditingItem(null);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleItemDelete = async (id: string) => {
    try {
      await categoryItemsService.delete(id);
      message.success('Xóa thành công');
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Nhóm danh mục khác</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingGroup(null);
            groupForm.resetFields();
            setGroupModalOpen(true);
          }}
        >
          Thêm nhóm
        </Button>
      </div>

      <Card loading={loading}>
        {groups.length > 0 ? (
          <Collapse accordion>
            {groups.map((group) => (
              <Panel
                key={group.id}
                header={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      <UnorderedListOutlined style={{ marginRight: 8 }} />
                      <strong>{group.name}</strong>
                      <Text type="secondary" style={{ marginLeft: 8 }}>({group.code})</Text>
                      {group.isSystem && <Tag color="blue" style={{ marginLeft: 8 }}>Hệ thống</Tag>}
                    </span>
                    <Space onClick={(e) => e.stopPropagation()}>
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => {
                          setEditingGroup(group);
                          groupForm.setFieldsValue(group);
                          setGroupModalOpen(true);
                        }}
                      />
                      {!group.isSystem && (
                        <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleGroupDelete(group.id)}>
                          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      )}
                      <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          setSelectedGroup(group);
                          setEditingItem(null);
                          itemForm.resetFields();
                          setItemModalOpen(true);
                        }}
                      >
                        Thêm giá trị
                      </Button>
                    </Space>
                  </div>
                }
              >
                {group.items?.length > 0 ? (
                  <List
                    size="small"
                    dataSource={group.items}
                    renderItem={(item: any) => (
                      <List.Item
                        actions={[
                          <Button
                            key="edit"
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => {
                              setSelectedGroup(group);
                              setEditingItem(item);
                              itemForm.setFieldsValue(item);
                              setItemModalOpen(true);
                            }}
                          />,
                          <Popconfirm
                            key="delete"
                            title="Xác nhận xóa?"
                            onConfirm={() => handleItemDelete(item.id)}
                          >
                            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                          </Popconfirm>,
                        ]}
                      >
                        <List.Item.Meta
                          title={item.name}
                          description={`Mã: ${item.code}${item.description ? ` - ${item.description}` : ''}`}
                        />
                        <Tag color={item.isActive ? 'green' : 'red'}>
                          {item.isActive ? 'Hoạt động' : 'Ngừng'}
                        </Tag>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="Chưa có giá trị" />
                )}
              </Panel>
            ))}
          </Collapse>
        ) : (
          <Empty description="Chưa có nhóm danh mục" />
        )}
      </Card>

      {/* Group Modal */}
      <Modal
        title={editingGroup ? 'Sửa nhóm' : 'Thêm nhóm danh mục'}
        open={groupModalOpen}
        onCancel={() => { setGroupModalOpen(false); setEditingGroup(null); groupForm.resetFields(); }}
        onOk={() => groupForm.submit()}
      >
        <Form form={groupForm} layout="vertical" onFinish={handleGroupSubmit}>
          <Form.Item name="code" label="Mã nhóm" rules={[{ required: true }]}>
            <Input placeholder="VD: DON_VI_TINH, MAU_SAC" />
          </Form.Item>
          <Form.Item name="name" label="Tên nhóm" rules={[{ required: true }]}>
            <Input placeholder="Tên nhóm danh mục" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Item Modal */}
      <Modal
        title={editingItem ? 'Sửa giá trị' : `Thêm giá trị cho: ${selectedGroup?.name}`}
        open={itemModalOpen}
        onCancel={() => { setItemModalOpen(false); setEditingItem(null); itemForm.resetFields(); }}
        onOk={() => itemForm.submit()}
      >
        <Form form={itemForm} layout="vertical" onFinish={handleItemSubmit}>
          <Form.Item name="code" label="Mã" rules={[{ required: true }]}>
            <Input placeholder="Mã giá trị" />
          </Form.Item>
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input placeholder="Tên giá trị" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
