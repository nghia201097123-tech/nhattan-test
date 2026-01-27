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
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { samplesService } from '@/services/samples.service';
import { Sample, SampleStatus } from '@/types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

const statusColors: Record<SampleStatus, string> = {
  COLLECTED: 'blue',
  PROCESSING: 'orange',
  EVALUATED: 'purple',
  IN_STORAGE: 'green',
  EXPORTED: 'cyan',
  DESTROYED: 'red',
};

const statusLabels: Record<SampleStatus, string> = {
  COLLECTED: 'Đã thu thập',
  PROCESSING: 'Đang xử lý',
  EVALUATED: 'Đã đánh giá',
  IN_STORAGE: 'Trong kho',
  EXPORTED: 'Đã xuất',
  DESTROYED: 'Đã huỷ',
};

export default function SampleCollectionPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Sample[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Sample | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await samplesService.getAll({
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
  }, [page, limit, search]);

  const handleCreate = () => {
    form.resetFields();
    setSelectedRecord(null);
    setIsModalOpen(true);
  };

  const handleEdit = (record: Sample) => {
    setSelectedRecord(record);
    form.setFieldsValue({
      ...record,
      collectionDate: record.collectionDate ? dayjs(record.collectionDate) : undefined,
    });
    setIsModalOpen(true);
  };

  const handleView = (record: Sample) => {
    setSelectedRecord(record);
    setIsDetailOpen(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa mẫu này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await samplesService.delete(id);
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
        collectionDate: values.collectionDate?.format('YYYY-MM-DD'),
      };

      if (selectedRecord) {
        await samplesService.update(selectedRecord.id, payload);
        message.success('Cập nhật thành công');
      } else {
        await samplesService.create(payload);
        message.success('Tạo mới thành công');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      message.error('Thao tác thất bại');
    }
  };

  const columns = [
    {
      title: 'Mã mẫu',
      dataIndex: 'sampleCode',
      key: 'sampleCode',
      width: 130,
    },
    {
      title: 'Tên mẫu',
      dataIndex: 'sampleName',
      key: 'sampleName',
      ellipsis: true,
    },
    {
      title: 'Nhóm giống',
      dataIndex: ['category', 'name'],
      key: 'category',
    },
    {
      title: 'Giống',
      dataIndex: ['variety', 'name'],
      key: 'variety',
    },
    {
      title: 'Ngày thu thập',
      dataIndex: 'collectionDate',
      key: 'collectionDate',
      width: 120,
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (val: number, record: Sample) => `${val} ${record.unit}`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: SampleStatus) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 130,
      render: (_: any, record: Sample) => (
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
        <Title level={4}>Thu thập mẫu giống</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Thêm mẫu mới
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
            showTotal: (total) => `Tổng ${total} mẫu`,
            onChange: (p, l) => {
              setPage(p);
              setLimit(l);
            },
          }}
        />
      </Card>

      {/* Modal tạo/sửa */}
      <Modal
        title={selectedRecord ? 'Cập nhật thông tin mẫu' : 'Thêm mẫu mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="sampleName" label="Tên mẫu" rules={[{ required: true, message: 'Vui lòng nhập tên mẫu' }]}>
                <Input placeholder="Nhập tên mẫu" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="categoryId" label="Nhóm giống" rules={[{ required: true }]}>
                <Select placeholder="Chọn nhóm giống" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="varietyId" label="Giống">
                <Select placeholder="Chọn giống" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="collectionDate" label="Ngày thu thập" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="quantity" label="Số lượng" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="unit" label="Đơn vị" initialValue="gram">
                <Select options={[
                  { value: 'gram', label: 'Gram' },
                  { value: 'kg', label: 'Kilogram' },
                  { value: 'hat', label: 'Hạt' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="providerId" label="Nguồn cung cấp">
                <Select placeholder="Chọn nguồn" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="collectionLocation" label="Địa điểm thu thập">
            <Input placeholder="Nhập địa điểm" />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={3} placeholder="Ghi chú thêm..." />
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
        title="Chi tiết mẫu giống"
        placement="right"
        width={600}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      >
        {selectedRecord && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Mã mẫu">{selectedRecord.sampleCode}</Descriptions.Item>
              <Descriptions.Item label="Tên mẫu">{selectedRecord.sampleName}</Descriptions.Item>
              <Descriptions.Item label="Nhóm giống">{selectedRecord.category?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Giống">{selectedRecord.variety?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Ngày thu thập">
                {selectedRecord.collectionDate ? dayjs(selectedRecord.collectionDate).format('DD/MM/YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Địa điểm thu thập">{selectedRecord.collectionLocation || '-'}</Descriptions.Item>
              <Descriptions.Item label="Nguồn cung cấp">{selectedRecord.provider?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Số lượng">{selectedRecord.quantity} {selectedRecord.unit}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={statusColors[selectedRecord.status]}>{statusLabels[selectedRecord.status]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú">{selectedRecord.notes || '-'}</Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <Title level={5}>File đính kèm</Title>
              <Upload
                listType="picture-card"
                showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
              >
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}
