'use client';

import { useState } from 'react';
import { Card, Tree, Button, Typography, Space, Modal, Form, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const treeData = [
    {
      title: 'Lúa',
      key: '1',
      children: [
        { title: 'Lúa nếp', key: '1-1' },
        { title: 'Lúa tẻ', key: '1-2' },
      ],
    },
    {
      title: 'Ngô',
      key: '2',
      children: [
        { title: 'Ngô nếp', key: '2-1' },
        { title: 'Ngô tẻ', key: '2-2' },
      ],
    },
    {
      title: 'Đậu',
      key: '3',
      children: [
        { title: 'Đậu tương', key: '3-1' },
        { title: 'Đậu xanh', key: '3-2' },
      ],
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Danh mục nhóm giống</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Thêm nhóm
        </Button>
      </div>
      <Card>
        <Tree
          showLine
          defaultExpandAll
          treeData={treeData}
          titleRender={(node) => (
            <Space>
              <span>{node.title as string}</span>
              <Button type="text" size="small" icon={<EditOutlined />} />
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Space>
          )}
        />
      </Card>

      <Modal
        title="Thêm nhóm giống"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Mã nhóm" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Tên nhóm" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="parentId" label="Nhóm cha">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
