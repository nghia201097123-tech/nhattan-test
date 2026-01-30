'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Tag,
  Typography,
  Tooltip,
  Modal,
  message,
  Form,
  DatePicker,
  InputNumber,
  Select,
  Row,
  Col,
  Drawer,
  Descriptions,
  Upload,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { evaluationsService, samplesService } from '@/services/samples.service';
import { evaluationCriteriaService } from '@/services/catalog.service';
import { usersService } from '@/services/users.service';
import { SampleEvaluation, Sample, User } from '@/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const resultColors: Record<string, string> = {
  PASS: 'green',
  FAIL: 'red',
  CONDITIONAL: 'orange',
};

const resultLabels: Record<string, string> = {
  PASS: 'Đạt',
  FAIL: 'Không đạt',
  CONDITIONAL: 'Đạt có điều kiện',
};

export default function SampleEvaluationPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SampleEvaluation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SampleEvaluation | null>(null);
  const [form] = Form.useForm();

  // Dropdown data
  const [samples, setSamples] = useState<Sample[]>([]);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [stages, setStages] = useState<any[]>([]);

  const loadDropdownData = async () => {
    try {
      const [samplesRes, usersRes, stagesRes] = await Promise.all([
        samplesService.getAll({ page: 1, limit: 500 }),
        usersService.getAll({ page: 1, limit: 500 }),
        evaluationCriteriaService.getStages(),
      ]);
      setSamples(samplesRes.data || []);
      // Filter only active users
      const activeUsers = (usersRes.data || []).filter((u: User) => u.isActive);
      setStaffList(activeUsers);
      setStages(stagesRes || []);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await evaluationsService.getAll({
        page,
        limit,
        search,
      });
      setData(result.data);
      setTotal(result.meta.total);
    } catch (error) {
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    loadDropdownData();
  }, [page, limit, search]);

  const handleCreate = () => {
    form.resetFields();
    setSelectedRecord(null);
    setIsModalOpen(true);
  };

  const handleEdit = (record: SampleEvaluation) => {
    setSelectedRecord(record);
    form.setFieldsValue({
      ...record,
      evaluationDate: record.evaluationDate ? dayjs(record.evaluationDate) : undefined,
    });
    setIsModalOpen(true);
  };

  const handleView = (record: SampleEvaluation) => {
    setSelectedRecord(record);
    setIsDetailOpen(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa đánh giá này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await evaluationsService.delete(id);
          message.success('Đã xóa thành công');
          fetchData();
        } catch (error) {
          message.error('Không thể xóa');
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        evaluationDate: values.evaluationDate?.format('YYYY-MM-DD'),
      };

      if (selectedRecord) {
        // Remove fields not allowed in update DTO
        const { sampleId, stageId, ...updatePayload } = payload;
        await evaluationsService.update(selectedRecord.id, updatePayload);
        message.success('Cập nhật thành công');
      } else {
        await evaluationsService.create(payload);
        message.success('Tạo mới thành công');
      }
      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (error: any) {
      console.error('Submit error:', error);
      message.error(error.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const columns = [
    {
      title: 'Mã mẫu',
      dataIndex: ['sample', 'code'],
      key: 'sampleCode',
      width: 130,
    },
    {
      title: 'Tên mẫu',
      dataIndex: ['sample', 'varietyName'],
      key: 'sampleName',
      ellipsis: true,
      render: (text: string, record: any) => text || record.sample?.localName || '-',
    },
    {
      title: 'Ngày đánh giá',
      dataIndex: 'evaluationDate',
      key: 'evaluationDate',
      width: 120,
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Người đánh giá',
      dataIndex: ['evaluator', 'fullName'],
      key: 'evaluator',
    },
    {
      title: 'Tỷ lệ nảy mầm',
      dataIndex: 'germinationRate',
      key: 'germinationRate',
      width: 130,
      render: (val: number) => val !== undefined ? `${val}%` : '-',
    },
    {
      title: 'Kết quả',
      dataIndex: 'overallResult',
      key: 'overallResult',
      width: 130,
      render: (result: string) => result ? (
        <Tag color={resultColors[result]}>{resultLabels[result]}</Tag>
      ) : '-',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 130,
      render: (_: any, record: SampleEvaluation) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Đánh giá mẫu giống</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Thêm đánh giá
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm theo mã hoặc tên mẫu..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
        </div>

        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đánh giá`,
            onChange: (p, l) => {
              setPage(p);
              setLimit(l);
            },
          }}
        />
      </Card>

      {/* Modal tạo/sửa */}
      <Modal
        title={selectedRecord ? 'Cập nhật đánh giá' : 'Thêm đánh giá mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="sampleId" label="Mẫu giống" rules={[{ required: true, message: 'Vui lòng chọn mẫu' }]}>
                <Select
                  placeholder="Chọn mẫu giống"
                  showSearch
                  allowClear
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {samples.map(s => (
                    <Select.Option key={s.id} value={s.id}>
                      {s.code} - {s.varietyName || s.localName || 'Chưa đặt tên'}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="evaluationDate" label="Ngày đánh giá" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="evaluatorId" label="Người đánh giá">
                <Select
                  placeholder="Chọn người đánh giá"
                  showSearch
                  allowClear
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {staffList.map(s => (
                    <Select.Option key={s.id} value={s.id}>{s.fullName}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="stageId" label="Giai đoạn đánh giá" rules={[{ required: true, message: 'Vui lòng chọn giai đoạn' }]}>
                <Select
                  placeholder="Chọn giai đoạn"
                  showSearch
                  optionFilterProp="children"
                >
                  {stages.map(stage => (
                    <Select.Option key={stage.id} value={stage.id}>{stage.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="germinationRate" label="Tỷ lệ nảy mầm (%)">
                <InputNumber style={{ width: '100%' }} min={0} max={100} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="overallResult" label="Kết quả chung">
                <Select
                  placeholder="Chọn kết quả"
                  options={[
                    { value: 'PASS', label: 'Đạt' },
                    { value: 'FAIL', label: 'Không đạt' },
                    { value: 'CONDITIONAL', label: 'Đạt có điều kiện' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="conclusion" label="Kết luận">
            <TextArea rows={2} placeholder="Kết luận đánh giá..." />
          </Form.Item>

          <Form.Item name="recommendations" label="Khuyến nghị">
            <TextArea rows={2} placeholder="Khuyến nghị xử lý..." />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={2} placeholder="Ghi chú thêm..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {selectedRecord ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer xem chi tiết */}
      <Drawer
        title="Chi tiết đánh giá"
        placement="right"
        width={700}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      >
        {selectedRecord && (
          <Tabs
            items={[
              {
                key: 'info',
                label: 'Thông tin chung',
                children: (
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Mã mẫu">{selectedRecord.sample?.code || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Tên mẫu">{selectedRecord.sample?.varietyName || selectedRecord.sample?.localName || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Ngày đánh giá">
                      {selectedRecord.evaluationDate ? dayjs(selectedRecord.evaluationDate).format('DD/MM/YYYY') : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Người đánh giá">{selectedRecord.evaluator?.fullName || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Tỷ lệ nảy mầm">
                      {selectedRecord.germinationRate !== undefined ? `${selectedRecord.germinationRate}%` : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Kết quả chung">
                      {selectedRecord.overallResult ? (
                        <Tag color={resultColors[selectedRecord.overallResult]}>
                          {resultLabels[selectedRecord.overallResult]}
                        </Tag>
                      ) : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Kết luận">{selectedRecord.conclusion || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Khuyến nghị">{selectedRecord.recommendations || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Ghi chú">{selectedRecord.notes || '-'}</Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'results',
                label: 'Kết quả chi tiết',
                children: (
                  <Table
                    dataSource={selectedRecord.results || []}
                    columns={[
                      { title: 'Tiêu chí', dataIndex: 'criteriaId', key: 'criteria' },
                      { title: 'Giá trị', dataIndex: 'numericValue', key: 'value' },
                      { title: 'Kết quả', dataIndex: 'isPassed', key: 'passed', render: (v: boolean) => v ? <Tag color="green">Đạt</Tag> : <Tag color="red">Không đạt</Tag> },
                      { title: 'Ghi chú', dataIndex: 'notes', key: 'notes' },
                    ]}
                    rowKey="id"
                    pagination={false}
                    size="small"
                  />
                ),
              },
              {
                key: 'images',
                label: 'Ảnh đánh giá',
                children: (
                  <Upload
                    listType="picture-card"
                    showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
                  >
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                ),
              },
            ]}
          />
        )}
      </Drawer>
    </div>
  );
}
