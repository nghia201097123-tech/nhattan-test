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
  Select,
  message,
  Popconfirm,
  Tag,
  Typography,
  Tabs,
  InputNumber,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { evaluationCriteriaService } from '@/services/catalog.service';

const { Title } = Typography;
const { TextArea } = Input;

const dataTypes = [
  { value: 'NUMBER', label: 'Số' },
  { value: 'TEXT', label: 'Văn bản' },
  { value: 'BOOLEAN', label: 'Có/Không' },
  { value: 'SELECT', label: 'Lựa chọn' },
];

export default function EvaluationCriteriaPage() {
  const [stages, setStages] = useState<any[]>([]);
  const [criteria, setCriteria] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [criteriaModalOpen, setCriteriaModalOpen] = useState(false);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedCriteria, setSelectedCriteria] = useState<any>(null);
  const [stageForm] = Form.useForm();
  const [criteriaForm] = Form.useForm();
  const [scoreForm] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stagesData, criteriaData] = await Promise.all([
        evaluationCriteriaService.getStages(),
        evaluationCriteriaService.getAll(),
      ]);
      setStages(stagesData);
      setCriteria(criteriaData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Stage handlers
  const handleStageSubmit = async (values: any) => {
    try {
      if (editingItem) {
        await evaluationCriteriaService.updateStage(editingItem.id, values);
        message.success('Cập nhật thành công');
      } else {
        await evaluationCriteriaService.createStage(values);
        message.success('Thêm mới thành công');
      }
      setStageModalOpen(false);
      stageForm.resetFields();
      setEditingItem(null);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleStageDelete = async (id: string) => {
    try {
      await evaluationCriteriaService.deleteStage(id);
      message.success('Xóa thành công');
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Criteria handlers
  const handleCriteriaSubmit = async (values: any) => {
    try {
      if (editingItem) {
        await evaluationCriteriaService.update(editingItem.id, values);
        message.success('Cập nhật thành công');
      } else {
        await evaluationCriteriaService.create(values);
        message.success('Thêm mới thành công');
      }
      setCriteriaModalOpen(false);
      criteriaForm.resetFields();
      setEditingItem(null);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleCriteriaDelete = async (id: string) => {
    try {
      await evaluationCriteriaService.delete(id);
      message.success('Xóa thành công');
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Score handlers
  const handleScoreSubmit = async (values: any) => {
    try {
      await evaluationCriteriaService.updateScores(selectedCriteria.id, values.scores || []);
      message.success('Cập nhật thang điểm thành công');
      setScoreModalOpen(false);
      scoreForm.resetFields();
      setSelectedCriteria(null);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const stageColumns = [
    { title: 'Mã', dataIndex: 'code', key: 'code', width: 100 },
    { title: 'Tên giai đoạn', dataIndex: 'name', key: 'name' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    { title: 'Ngày từ khi bắt đầu', dataIndex: 'daysFromStart', key: 'daysFromStart' },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (val: boolean) => <Tag color={val ? 'green' : 'red'}>{val ? 'Hoạt động' : 'Ngừng'}</Tag>,
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
              stageForm.setFieldsValue(record);
              setStageModalOpen(true);
            }}
          />
          <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleStageDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const criteriaColumns = [
    { title: 'Mã', dataIndex: 'code', key: 'code', width: 100 },
    { title: 'Tên tiêu chí', dataIndex: 'name', key: 'name' },
    { title: 'Đơn vị', dataIndex: 'unit', key: 'unit' },
    {
      title: 'Kiểu dữ liệu',
      dataIndex: 'dataType',
      key: 'dataType',
      render: (type: string) => dataTypes.find((t) => t.value === type)?.label || type,
    },
    {
      title: 'Giai đoạn',
      dataIndex: 'stage',
      key: 'stage',
      render: (stage: any) => stage?.name || '-',
    },
    {
      title: 'Bắt buộc',
      dataIndex: 'isRequired',
      key: 'isRequired',
      render: (val: boolean) => (val ? <Tag color="red">Bắt buộc</Tag> : '-'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingItem(record);
              criteriaForm.setFieldsValue({ ...record, stageId: record.stage?.id });
              setCriteriaModalOpen(true);
            }}
          />
          <Button
            type="text"
            icon={<SettingOutlined />}
            title="Thang điểm"
            onClick={() => {
              setSelectedCriteria(record);
              scoreForm.setFieldsValue({ scores: record.scores || [] });
              setScoreModalOpen(true);
            }}
          />
          <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleCriteriaDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'criteria',
      label: 'Tiêu chí đánh giá',
      children: (
        <>
          <div style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingItem(null);
                criteriaForm.resetFields();
                setCriteriaModalOpen(true);
              }}
            >
              Thêm tiêu chí
            </Button>
          </div>
          <Table columns={criteriaColumns} dataSource={criteria} rowKey="id" loading={loading} />
        </>
      ),
    },
    {
      key: 'stages',
      label: 'Giai đoạn đánh giá',
      children: (
        <>
          <div style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingItem(null);
                stageForm.resetFields();
                setStageModalOpen(true);
              }}
            >
              Thêm giai đoạn
            </Button>
          </div>
          <Table columns={stageColumns} dataSource={stages} rowKey="id" loading={loading} />
        </>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>Tiêu chuẩn đánh giá</Title>
      <Card>
        <Tabs items={tabItems} />
      </Card>

      {/* Stage Modal */}
      <Modal
        title={editingItem ? 'Sửa giai đoạn' : 'Thêm giai đoạn'}
        open={stageModalOpen}
        onCancel={() => { setStageModalOpen(false); setEditingItem(null); stageForm.resetFields(); }}
        onOk={() => stageForm.submit()}
      >
        <Form form={stageForm} layout="vertical" onFinish={handleStageSubmit}>
          <Form.Item name="code" label="Mã" rules={[{ required: true }]}>
            <Input placeholder="VD: GD01" />
          </Form.Item>
          <Form.Item name="name" label="Tên giai đoạn" rules={[{ required: true }]}>
            <Input placeholder="Tên giai đoạn" />
          </Form.Item>
          <Form.Item name="daysFromStart" label="Số ngày từ khi bắt đầu">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Criteria Modal */}
      <Modal
        title={editingItem ? 'Sửa tiêu chí' : 'Thêm tiêu chí'}
        open={criteriaModalOpen}
        onCancel={() => { setCriteriaModalOpen(false); setEditingItem(null); criteriaForm.resetFields(); }}
        onOk={() => criteriaForm.submit()}
        width={600}
      >
        <Form form={criteriaForm} layout="vertical" onFinish={handleCriteriaSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="code" label="Mã" rules={[{ required: true }]}>
              <Input placeholder="VD: TC01" />
            </Form.Item>
            <Form.Item name="stageId" label="Giai đoạn">
              <Select
                allowClear
                placeholder="Chọn giai đoạn"
                options={stages.map((s) => ({ label: s.name, value: s.id }))}
              />
            </Form.Item>
          </div>
          <Form.Item name="name" label="Tên tiêu chí" rules={[{ required: true }]}>
            <Input placeholder="Tên tiêu chí" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item name="dataType" label="Kiểu dữ liệu" rules={[{ required: true }]}>
              <Select options={dataTypes} placeholder="Chọn kiểu" />
            </Form.Item>
            <Form.Item name="unit" label="Đơn vị">
              <Input placeholder="VD: cm, kg" />
            </Form.Item>
            <Form.Item name="isRequired" label="Bắt buộc" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="minValue" label="Giá trị min">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="maxValue" label="Giá trị max">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Score Modal */}
      <Modal
        title={`Thang điểm: ${selectedCriteria?.name}`}
        open={scoreModalOpen}
        onCancel={() => { setScoreModalOpen(false); setSelectedCriteria(null); scoreForm.resetFields(); }}
        onOk={() => scoreForm.submit()}
        width={600}
      >
        <Form form={scoreForm} layout="vertical" onFinish={handleScoreSubmit}>
          <Form.List name="scores">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <Form.Item {...restField} name={[name, 'minScore']} style={{ flex: 1 }}>
                      <InputNumber placeholder="Min" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'maxScore']} style={{ flex: 1 }}>
                      <InputNumber placeholder="Max" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'label']} style={{ flex: 2 }}>
                      <Input placeholder="Nhãn (VD: Tốt, Khá)" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'color']} style={{ flex: 1 }}>
                      <Input placeholder="Màu" />
                    </Form.Item>
                    <Button type="text" danger onClick={() => remove(name)} icon={<DeleteOutlined />} />
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Thêm mức điểm
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}
