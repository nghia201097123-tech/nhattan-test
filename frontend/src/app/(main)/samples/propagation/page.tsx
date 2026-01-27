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
  Progress,
  Descriptions,
  Drawer,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import { propagationService, samplesService } from '@/services/samples.service';
import { staffService } from '@/services/catalog.service';
import { PropagationBatch, PropagationStatus, Sample, Staff } from '@/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const statusColors: Record<PropagationStatus, string> = {
  PLANNED: 'blue',
  IN_PROGRESS: 'processing',
  HARVESTED: 'orange',
  COMPLETED: 'green',
  CANCELLED: 'red',
};

const statusLabels: Record<PropagationStatus, string> = {
  PLANNED: 'Đã lên kế hoạch',
  IN_PROGRESS: 'Đang thực hiện',
  HARVESTED: 'Đã thu hoạch',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

export default function PropagationPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PropagationBatch[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PropagationBatch | null>(null);
  const [form] = Form.useForm();
  const [harvestForm] = Form.useForm();
  const [progressForm] = Form.useForm();

  // Dropdown data
  const [samples, setSamples] = useState<Sample[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);

  const loadDropdownData = async () => {
    try {
      const [samplesRes, staffRes] = await Promise.all([
        samplesService.getAll({ limit: 1000 }),
        staffService.getAll({ limit: 1000 }),
      ]);
      setSamples(samplesRes.data || []);
      setStaffList(staffRes.data || []);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await propagationService.getAll({
        page,
        limit,
        search,
        status: statusFilter,
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
  }, [page, limit, search, statusFilter]);

  const handleCreate = () => {
    form.resetFields();
    setSelectedRecord(null);
    setIsModalOpen(true);
  };

  const handleEdit = (record: PropagationBatch) => {
    setSelectedRecord(record);
    form.setFieldsValue({
      ...record,
      startDate: record.startDate ? dayjs(record.startDate) : undefined,
      expectedEndDate: record.expectedEndDate ? dayjs(record.expectedEndDate) : undefined,
    });
    setIsModalOpen(true);
  };

  const handleView = (record: PropagationBatch) => {
    setSelectedRecord(record);
    setIsDetailOpen(true);
  };

  const handleUpdateProgress = (record: PropagationBatch) => {
    setSelectedRecord(record);
    progressForm.setFieldsValue({
      progress: record.progress,
      status: record.status,
    });
    setIsProgressModalOpen(true);
  };

  const handleHarvest = (record: PropagationBatch) => {
    setSelectedRecord(record);
    harvestForm.resetFields();
    setIsHarvestModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa đợt nhân mẫu này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await propagationService.delete(id);
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
        startDate: values.startDate?.format('YYYY-MM-DD'),
        expectedEndDate: values.expectedEndDate?.format('YYYY-MM-DD'),
      };

      if (selectedRecord) {
        await propagationService.update(selectedRecord.id, payload);
        message.success('Cập nhật thành công');
      } else {
        await propagationService.create(payload);
        message.success('Tạo mới thành công');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      message.error('Thao tác thất bại');
    }
  };

  const handleProgressSubmit = async (values: any) => {
    if (!selectedRecord) return;
    try {
      await propagationService.updateProgress(selectedRecord.id, values);
      message.success('Cập nhật tiến độ thành công');
      setIsProgressModalOpen(false);
      fetchData();
    } catch (error) {
      message.error('Không thể cập nhật tiến độ');
    }
  };

  const handleHarvestSubmit = async (values: any) => {
    if (!selectedRecord) return;
    try {
      await propagationService.recordHarvest(selectedRecord.id, {
        ...values,
        harvestDate: values.harvestDate?.format('YYYY-MM-DD'),
      });
      message.success('Nhập kết quả thu hoạch thành công');
      setIsHarvestModalOpen(false);
      fetchData();
    } catch (error) {
      message.error('Không thể nhập kết quả thu hoạch');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await propagationService.complete(id);
      message.success('Đã hoàn thành đợt nhân mẫu');
      fetchData();
    } catch (error) {
      message.error('Không thể hoàn thành');
    }
  };

  const handleCancel = async (id: string) => {
    Modal.confirm({
      title: 'Xác nhận hủy',
      content: 'Bạn có chắc chắn muốn hủy đợt nhân mẫu này?',
      okText: 'Hủy đợt nhân',
      okType: 'danger',
      cancelText: 'Đóng',
      onOk: async () => {
        try {
          await propagationService.cancel(id);
          message.success('Đã hủy đợt nhân mẫu');
          fetchData();
        } catch (error) {
          message.error('Không thể hủy');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Mã đợt',
      dataIndex: 'code',
      key: 'code',
      width: 130,
    },
    {
      title: 'Tên đợt',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Mẫu gốc',
      dataIndex: ['sample', 'sampleCode'],
      key: 'sample',
      render: (_: any, record: PropagationBatch) => (
        <span>{record.sample?.sampleCode} - {record.sample?.sampleName}</span>
      ),
    },
    {
      title: 'Người phụ trách',
      dataIndex: ['propagator', 'fullName'],
      key: 'propagator',
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 110,
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      render: (progress: number) => (
        <Progress percent={progress} size="small" />
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: PropagationStatus) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 180,
      render: (_: any, record: PropagationBatch) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          </Tooltip>
          <Tooltip title="Cập nhật tiến độ">
            <Button type="text" size="small" icon={<FieldTimeOutlined />} onClick={() => handleUpdateProgress(record)} />
          </Tooltip>
          {record.status === 'IN_PROGRESS' && (
            <Tooltip title="Nhập thu hoạch">
              <Button type="text" size="small" icon={<CheckOutlined />} onClick={() => handleHarvest(record)} />
            </Tooltip>
          )}
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
        <Title level={4}>Quản lý đợt nhân mẫu</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Tạo đợt nhân mới
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
          <Input
            placeholder="Tìm kiếm theo mã, tên..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
          <Select
            placeholder="Trạng thái"
            style={{ width: 180 }}
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            options={Object.entries(statusLabels).map(([value, label]) => ({
              value,
              label,
            }))}
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
            showTotal: (total) => `Tổng ${total} đợt nhân`,
            onChange: (p, l) => {
              setPage(p);
              setLimit(l);
            },
          }}
        />
      </Card>

      {/* Modal tạo/sửa */}
      <Modal
        title={selectedRecord ? 'Cập nhật đợt nhân mẫu' : 'Tạo đợt nhân mẫu mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Tên đợt nhân">
            <Input placeholder="Nhập tên đợt nhân" />
          </Form.Item>
          <Form.Item name="sampleId" label="Mẫu gốc" rules={[{ required: true, message: 'Vui lòng chọn mẫu gốc' }]}>
            <Select
              placeholder="Chọn mẫu gốc"
              showSearch
              allowClear
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {samples.map(s => (
                <Select.Option key={s.id} value={s.id}>
                  {s.sampleCode} - {s.sampleName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="propagatorId" label="Người phụ trách">
            <Select
              placeholder="Chọn người phụ trách"
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
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="startDate" label="Ngày bắt đầu" style={{ flex: 1 }} rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="expectedEndDate" label="Ngày dự kiến kết thúc" style={{ flex: 1 }}>
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="initialQuantity" label="Số lượng ban đầu" style={{ flex: 1 }} rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item name="initialUnit" label="Đơn vị" style={{ flex: 1 }}>
              <Select placeholder="Chọn đơn vị" options={[
                { value: 'gram', label: 'Gram' },
                { value: 'kg', label: 'Kilogram' },
                { value: 'hat', label: 'Hạt' },
              ]} />
            </Form.Item>
          </div>
          <Form.Item name="propagationLocation" label="Vị trí nhân mẫu">
            <Input placeholder="Nhập vị trí" />
          </Form.Item>
          <Form.Item name="propagationMethod" label="Phương pháp nhân giống">
            <Input placeholder="Nhập phương pháp" />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={3} placeholder="Ghi chú..." />
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

      {/* Modal cập nhật tiến độ */}
      <Modal
        title="Cập nhật tiến độ"
        open={isProgressModalOpen}
        onCancel={() => setIsProgressModalOpen(false)}
        footer={null}
        width={400}
      >
        <Form form={progressForm} layout="vertical" onFinish={handleProgressSubmit}>
          <Form.Item name="progress" label="Tiến độ (%)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} max={100} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái">
            <Select
              options={Object.entries(statusLabels).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsProgressModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">Cập nhật</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal nhập kết quả thu hoạch */}
      <Modal
        title="Nhập kết quả thu hoạch"
        open={isHarvestModalOpen}
        onCancel={() => setIsHarvestModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form form={harvestForm} layout="vertical" onFinish={handleHarvestSubmit}>
          <Form.Item name="harvestDate" label="Ngày thu hoạch" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="harvestQuantity" label="Số lượng thu hoạch" style={{ flex: 1 }} rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item name="harvestUnit" label="Đơn vị" style={{ flex: 1 }}>
              <Select placeholder="Chọn đơn vị" options={[
                { value: 'gram', label: 'Gram' },
                { value: 'kg', label: 'Kilogram' },
                { value: 'hat', label: 'Hạt' },
              ]} />
            </Form.Item>
          </div>
          <Form.Item name="qualityRating" label="Đánh giá chất lượng">
            <Select placeholder="Chọn mức đánh giá" options={[
              { value: 'A', label: 'Loại A - Xuất sắc' },
              { value: 'B', label: 'Loại B - Tốt' },
              { value: 'C', label: 'Loại C - Trung bình' },
              { value: 'D', label: 'Loại D - Kém' },
            ]} />
          </Form.Item>
          <Form.Item name="harvestNotes" label="Ghi chú thu hoạch">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsHarvestModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">Lưu kết quả</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer xem chi tiết */}
      <Drawer
        title="Chi tiết đợt nhân mẫu"
        placement="right"
        width={600}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        extra={
          <Space>
            {selectedRecord?.status === 'HARVESTED' && (
              <Button type="primary" onClick={() => handleComplete(selectedRecord.id)}>
                Hoàn thành
              </Button>
            )}
            {selectedRecord?.status !== 'COMPLETED' && selectedRecord?.status !== 'CANCELLED' && (
              <Button danger onClick={() => handleCancel(selectedRecord!.id)}>
                Hủy đợt nhân
              </Button>
            )}
          </Space>
        }
      >
        {selectedRecord && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Mã đợt">{selectedRecord.code}</Descriptions.Item>
            <Descriptions.Item label="Tên đợt">{selectedRecord.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="Mẫu gốc">
              {selectedRecord.sample?.sampleCode} - {selectedRecord.sample?.sampleName}
            </Descriptions.Item>
            <Descriptions.Item label="Người phụ trách">
              {selectedRecord.propagator?.fullName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày bắt đầu">
              {selectedRecord.startDate ? dayjs(selectedRecord.startDate).format('DD/MM/YYYY') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày dự kiến kết thúc">
              {selectedRecord.expectedEndDate ? dayjs(selectedRecord.expectedEndDate).format('DD/MM/YYYY') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng ban đầu">
              {selectedRecord.initialQuantity} {selectedRecord.initialUnit}
            </Descriptions.Item>
            <Descriptions.Item label="Vị trí nhân mẫu">
              {selectedRecord.propagationLocation || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Phương pháp">
              {selectedRecord.propagationMethod || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Tiến độ">
              <Progress percent={selectedRecord.progress} />
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={statusColors[selectedRecord.status]}>
                {statusLabels[selectedRecord.status]}
              </Tag>
            </Descriptions.Item>
            {selectedRecord.harvestDate && (
              <>
                <Descriptions.Item label="Ngày thu hoạch">
                  {dayjs(selectedRecord.harvestDate).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Số lượng thu hoạch">
                  {selectedRecord.harvestQuantity} {selectedRecord.harvestUnit}
                </Descriptions.Item>
                <Descriptions.Item label="Chất lượng">
                  {selectedRecord.qualityRating || '-'}
                </Descriptions.Item>
              </>
            )}
            <Descriptions.Item label="Ghi chú">
              {selectedRecord.notes || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
