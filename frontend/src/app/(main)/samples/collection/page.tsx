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
  Divider,
  TreeSelect,
} from 'antd';
import type { UploadFile } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { samplesService } from '@/services/samples.service';
import {
  seedCategoriesService,
  seedVarietiesService,
  sampleProvidersService,
  staffService,
} from '@/services/catalog.service';
import { Sample, SampleStatus, SeedCategory, SeedVariety, SampleProvider, Staff } from '@/types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

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

const seasonOptions = [
  { value: 'Xuân', label: 'Xuân' },
  { value: 'Hè', label: 'Hè' },
  { value: 'Thu', label: 'Thu' },
  { value: 'Đông', label: 'Đông' },
  { value: 'Xuân-Hè', label: 'Xuân-Hè' },
  { value: 'Thu-Đông', label: 'Thu-Đông' },
];

const conditionOptions = [
  { value: 'good', label: 'Tốt' },
  { value: 'medium', label: 'Trung bình' },
  { value: 'poor', label: 'Kém' },
];

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

  // Dropdown data
  const [categories, setCategories] = useState<SeedCategory[]>([]);
  const [varieties, setVarieties] = useState<SeedVariety[]>([]);
  const [providers, setProviders] = useState<SampleProvider[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

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

  const loadDropdownData = async () => {
    try {
      const [categoriesRes, varietiesRes, providersRes, staffRes] = await Promise.all([
        seedCategoriesService.getTree(),
        seedVarietiesService.getAll({ limit: 1000 }),
        sampleProvidersService.getAll({ limit: 1000 }),
        staffService.getAll({ limit: 1000 }),
      ]);
      setCategories(categoriesRes || []);
      setVarieties(varietiesRes.data || []);
      setProviders(providersRes.data || []);
      setStaffList(staffRes.data || []);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    loadDropdownData();
  }, [page, limit, search]);

  const handleCreate = () => {
    form.resetFields();
    setSelectedRecord(null);
    setFileList([]);
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
      const collectionDate = values.collectionDate?.format('YYYY-MM-DD');
      const collectionYear = values.collectionDate ? values.collectionDate.year() : undefined;

      const payload = {
        ...values,
        collectionDate,
        collectionYear,
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

  // Convert categories to tree data for TreeSelect
  const buildCategoryTree = (items: SeedCategory[]): any[] => {
    return items.map(item => ({
      value: item.id,
      title: item.name,
      children: item.children ? buildCategoryTree(item.children) : [],
    }));
  };

  const columns = [
    {
      title: 'Mã mẫu',
      dataIndex: 'code',
      key: 'code',
      width: 130,
    },
    {
      title: 'Tên giống',
      dataIndex: 'varietyName',
      key: 'varietyName',
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
      dataIndex: 'initialQuantity',
      key: 'initialQuantity',
      width: 120,
      render: (val: number, record: Sample) => val ? `${val} ${record.quantityUnit || 'gram'}` : '-',
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
        width={900}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* THÔNG TIN GIỐNG */}
          <Divider orientation="left">Thông tin giống</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="categoryId" label="Nhóm giống" rules={[{ required: true, message: 'Vui lòng chọn nhóm giống' }]}>
                <TreeSelect
                  placeholder="Chọn nhóm giống"
                  treeData={buildCategoryTree(categories)}
                  showSearch
                  treeDefaultExpandAll
                  allowClear
                  filterTreeNode={(input, option) =>
                    (option?.title as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="varietyId" label="Giống">
                <Select
                  placeholder="Chọn giống"
                  showSearch
                  allowClear
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {varieties.map(v => (
                    <Select.Option key={v.id} value={v.id}>{v.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="varietyName" label="Tên giống">
                <Input placeholder="Nhập tên giống" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="localName" label="Tên địa phương">
                <Input placeholder="Nhập tên địa phương" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="scientificName" label="Tên khoa học">
                <Input placeholder="Nhập tên khoa học" />
              </Form.Item>
            </Col>
          </Row>

          {/* THÔNG TIN THU THẬP */}
          <Divider orientation="left">Thông tin thu thập</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="collectionDate" label="Ngày thu thập" rules={[{ required: true, message: 'Vui lòng chọn ngày thu thập' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="season" label="Mùa vụ">
                <Select placeholder="Chọn mùa vụ" allowClear options={seasonOptions} />
              </Form.Item>
            </Col>
          </Row>

          {/* NGUỒN CUNG CẤP & NGƯỜI THU THẬP */}
          <Divider orientation="left">Nguồn cung cấp & Người thu thập</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="providerId" label="Nguồn cung cấp">
                <Select
                  placeholder="Chọn nguồn cung cấp"
                  showSearch
                  allowClear
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {providers.map(p => (
                    <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="providerName" label="Tên nguồn cung cấp (khác)">
                <Input placeholder="Nhập tên nguồn nếu không có trong danh sách" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="collectorId" label="Người thu thập">
                <Select
                  placeholder="Chọn người thu thập"
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
          </Row>

          {/* THÔNG TIN MẪU */}
          <Divider orientation="left">Thông tin mẫu</Divider>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="initialQuantity" label="Số lượng ban đầu" rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}>
                <InputNumber style={{ width: '100%' }} min={0} placeholder="Nhập số lượng" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="currentQuantity" label="Số lượng hiện tại">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="Nhập số lượng" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="quantityUnit" label="Đơn vị" initialValue="gram">
                <Select>
                  <Select.Option value="gram">Gram</Select.Option>
                  <Select.Option value="kg">Kilogram</Select.Option>
                  <Select.Option value="hat">Hạt</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="sampleCondition" label="Tình trạng mẫu">
                <Select placeholder="Chọn tình trạng" allowClear options={conditionOptions} />
              </Form.Item>
            </Col>
          </Row>

          {/* ẢNH ĐÍNH KÈM */}
          <Divider orientation="left">Ảnh đính kèm</Divider>

          <Form.Item name="attachments">
            <Dragger
              multiple
              listType="picture"
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Nhấp hoặc kéo thả file vào đây để upload</p>
              <p className="ant-upload-hint">Hỗ trợ nhiều file. Chấp nhận ảnh và tài liệu.</p>
            </Dragger>
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
        width={650}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      >
        {selectedRecord && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Mã mẫu">{selectedRecord.code || '-'}</Descriptions.Item>
              <Descriptions.Item label="Nhóm giống">{selectedRecord.category?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Giống">{selectedRecord.variety?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Tên giống">{selectedRecord.varietyName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Tên địa phương">{selectedRecord.localName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Tên khoa học">{selectedRecord.scientificName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Ngày thu thập">
                {selectedRecord.collectionDate ? dayjs(selectedRecord.collectionDate).format('DD/MM/YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Năm thu thập">{selectedRecord.collectionYear || '-'}</Descriptions.Item>
              <Descriptions.Item label="Mùa vụ">{selectedRecord.season || '-'}</Descriptions.Item>
              <Descriptions.Item label="Nguồn cung cấp">{selectedRecord.provider?.name || selectedRecord.providerName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Người thu thập">{selectedRecord.collector?.fullName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Số lượng ban đầu">{selectedRecord.initialQuantity} {selectedRecord.quantityUnit}</Descriptions.Item>
              <Descriptions.Item label="Số lượng hiện tại">{selectedRecord.currentQuantity} {selectedRecord.quantityUnit}</Descriptions.Item>
              <Descriptions.Item label="Tình trạng mẫu">{selectedRecord.sampleCondition || '-'}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={statusColors[selectedRecord.status]}>{statusLabels[selectedRecord.status]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú">{selectedRecord.notes || '-'}</Descriptions.Item>
            </Descriptions>

            <Divider>Ảnh đính kèm</Divider>
            <Upload
              listType="picture-card"
              showUploadList={{ showPreviewIcon: true, showRemoveIcon: false }}
              beforeUpload={() => false}
            />
          </>
        )}
      </Drawer>
    </div>
  );
}
