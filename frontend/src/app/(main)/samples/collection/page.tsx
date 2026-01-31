'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  Spin,
  Alert,
} from 'antd';
import type { UploadFile } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  InboxOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { samplesService } from '@/services/samples.service';
import {
  seedCategoriesService,
  seedVarietiesService,
  sampleProvidersService,
} from '@/services/catalog.service';
import { usersService } from '@/services/users.service';
import { Sample, SampleStatus, SeedCategory, SeedVariety, SampleProvider, User } from '@/types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const statusColors: Record<SampleStatus, string> = {
  COLLECTED: 'blue', PROCESSING: 'orange', EVALUATED: 'purple',
  IN_STORAGE: 'green', EXPORTED: 'cyan', DESTROYED: 'red',
};
const statusLabels: Record<SampleStatus, string> = {
  COLLECTED: 'Đã thu thập', PROCESSING: 'Đang xử lý', EVALUATED: 'Đã đánh giá',
  IN_STORAGE: 'Trong kho', EXPORTED: 'Đã xuất', DESTROYED: 'Đã huỷ',
};
const seasonOptions = [
  { value: 'Xuân', label: 'Xuân' }, { value: 'Hè', label: 'Hè' },
  { value: 'Thu', label: 'Thu' }, { value: 'Đông', label: 'Đông' },
  { value: 'Xuân-Hè', label: 'Xuân-Hè' }, { value: 'Thu-Đông', label: 'Thu-Đông' },
];
const conditionOptions = [
  { value: 'good', label: 'Tốt' }, { value: 'medium', label: 'Trung bình' }, { value: 'poor', label: 'Kém' },
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

  const [categories, setCategories] = useState<SeedCategory[]>([]);
  const [varieties, setVarieties] = useState<SeedVariety[]>([]);
  const [providers, setProviders] = useState<SampleProvider[]>([]);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingVarieties, setLoadingVarieties] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();

  // Template: chọn mẫu có sẵn
  const [existingSamples, setExistingSamples] = useState<any[]>([]);
  const [searchingSamples, setSearchingSamples] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const searchTimer = useRef<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await samplesService.getAll({ page, limit, search });
      setData(result.data);
      setTotal(result.meta.total);
    } catch { message.error('Không thể tải dữ liệu'); }
    finally { setLoading(false); }
  };

  const loadCategories = async () => {
    setLoadingCategories(true);
    try { const res = await seedCategoriesService.getTree(); setCategories(Array.isArray(res) ? res : []); }
    catch { /* ignore */ }
    finally { setLoadingCategories(false); }
  };

  const loadVarieties = async (categoryId?: string) => {
    setLoadingVarieties(true);
    try {
      if (categoryId) {
        const res = await seedVarietiesService.getByCategory(categoryId);
        setVarieties(Array.isArray(res) ? res : []);
      } else {
        const res = await seedVarietiesService.getAll({ page: 1, limit: 500 });
        const d = res?.data || res;
        setVarieties(Array.isArray(d) ? d : []);
      }
    } catch { setVarieties([]); }
    finally { setLoadingVarieties(false); }
  };

  const loadProviders = async () => {
    setLoadingProviders(true);
    try { const res = await sampleProvidersService.getAll({ page: 1, limit: 500 }); setProviders(Array.isArray(res?.data || res) ? (res?.data || res) : []); }
    catch { setProviders([]); }
    finally { setLoadingProviders(false); }
  };

  const loadStaff = async () => {
    setLoadingStaff(true);
    try { const res = await usersService.getAll({ page: 1, limit: 500 }); setStaffList((res?.data || []).filter((u: User) => u.isActive)); }
    catch { setStaffList([]); }
    finally { setLoadingStaff(false); }
  };

  // Search mẫu đã có (debounced)
  const handleSearchExisting = useCallback((keyword: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!keyword || keyword.length < 2) { setExistingSamples([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearchingSamples(true);
      try {
        const res = await samplesService.getAll({ page: 1, limit: 20, search: keyword });
        setExistingSamples(res.data || []);
      } catch { setExistingSamples([]); }
      finally { setSearchingSamples(false); }
    }, 300);
  }, []);

  useEffect(() => { fetchData(); }, [page, limit, search]);
  useEffect(() => { loadCategories(); loadVarieties(); loadProviders(); loadStaff(); }, []);
  useEffect(() => {
    if (selectedCategoryId) { loadVarieties(selectedCategoryId); form.setFieldValue('varietyId', undefined); }
  }, [selectedCategoryId]);

  // Áp dụng thông tin giống từ mẫu đã có
  const applyTemplate = (sampleId: string) => {
    const sample = existingSamples.find((s: any) => s.id === sampleId);
    if (!sample) return;
    setSelectedTemplate(sample);
    setSelectedCategoryId(sample.categoryId);
    form.setFieldsValue({
      categoryId: sample.categoryId,
      varietyId: sample.varietyId,
      varietyName: sample.varietyName,
      localName: sample.localName,
      scientificName: sample.scientificName,
      providerId: sample.providerId,
      quantityUnit: sample.quantityUnit || 'gram',
    });
    if (sample.categoryId) loadVarieties(sample.categoryId);
  };

  const handleCreate = () => {
    form.resetFields();
    setSelectedRecord(null);
    setFileList([]);
    setSelectedCategoryId(undefined);
    setSelectedTemplate(null);
    setExistingSamples([]);
    setIsModalOpen(true);
    loadVarieties();
  };

  const handleEdit = (record: Sample) => {
    setSelectedRecord(record);
    setSelectedTemplate(null);
    setSelectedCategoryId(record.categoryId);
    form.setFieldsValue({ ...record, collectionDate: record.collectionDate ? dayjs(record.collectionDate) : undefined });
    setIsModalOpen(true);
    if (record.categoryId) loadVarieties(record.categoryId);
  };

  const handleView = (record: Sample) => { setSelectedRecord(record); setIsDetailOpen(true); };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa', content: 'Bạn có chắc chắn muốn xóa mẫu này?',
      okText: 'Xóa', okType: 'danger', cancelText: 'Hủy',
      onOk: async () => {
        try { await samplesService.delete(id); message.success('Đã xóa'); fetchData(); }
        catch { message.error('Không thể xóa'); }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      const { attachments, collectionDate: _, templateSampleId, ...rest } = values;
      const payload = { ...rest, collectionDate: values.collectionDate?.format('YYYY-MM-DD'), collectionYear: values.collectionDate?.year() };

      if (selectedRecord) {
        await samplesService.update(selectedRecord.id, payload);
        message.success('Cập nhật thành công');
      } else {
        await samplesService.create(payload);
        message.success('Tạo phiếu thu nhập mẫu thành công');
      }
      setIsModalOpen(false); form.resetFields(); setFileList([]); setSelectedTemplate(null); fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const buildCategoryTree = (items: SeedCategory[]): any[] => {
    if (!items?.length) return [];
    return items.map(item => ({
      value: item.id, title: item.name,
      children: item.children?.length ? buildCategoryTree(item.children) : undefined,
    }));
  };

  const columns = [
    { title: 'Mã mẫu', dataIndex: 'code', key: 'code', width: 130 },
    { title: 'Tên mẫu giống', dataIndex: 'varietyName', key: 'varietyName', ellipsis: true },
    { title: 'Nhóm giống', dataIndex: ['category', 'name'], key: 'category' },
    { title: 'Giống', dataIndex: ['variety', 'name'], key: 'variety' },
    { title: 'Ngày thu thập', dataIndex: 'collectionDate', key: 'collectionDate', width: 120,
      render: (d: string) => d ? dayjs(d).format('DD/MM/YYYY') : '-' },
    { title: 'Số lượng', dataIndex: 'initialQuantity', key: 'initialQuantity', width: 120,
      render: (v: number, r: any) => v ? `${v} ${r.quantityUnit || 'gram'}` : '-' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 120,
      render: (s: SampleStatus) => <Tag color={statusColors[s]}>{statusLabels[s]}</Tag> },
    { title: 'Thao tác', key: 'actions', width: 130,
      render: (_: any, r: Sample) => (
        <Space size="small">
          <Tooltip title="Xem"><Button type="text" size="small" icon={<EyeOutlined />} onClick={() => handleView(r)} /></Tooltip>
          <Tooltip title="Sửa"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} /></Tooltip>
          <Tooltip title="Xóa"><Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} /></Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Thu thập mẫu giống</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>Tạo phiếu thu nhập</Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input placeholder="Tìm kiếm theo mã hoặc tên mẫu..." prefix={<SearchOutlined />}
            style={{ width: 300 }} value={search} onChange={(e) => setSearch(e.target.value)} allowClear />
        </div>
        <Table dataSource={data} columns={columns} rowKey="id" loading={loading}
          pagination={{
            current: page, pageSize: limit, total, showSizeChanger: true,
            showTotal: (t) => `Tổng ${t} mẫu`,
            onChange: (p, l) => { setPage(p); setLimit(l); },
          }}
        />
      </Card>

      {/* Modal tạo/sửa phiếu thu nhập */}
      <Modal
        title={selectedRecord ? 'Cập nhật thông tin mẫu' : 'Tạo phiếu thu nhập mẫu'}
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); setSelectedTemplate(null); }}
        footer={null} width={900}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Chọn mẫu có sẵn (chỉ khi tạo mới) */}
          {!selectedRecord && (
            <>
              <Alert type="info" showIcon icon={<CopyOutlined />}
                message="Chọn mẫu đã thu thập trước đó để kế thừa thông tin giống, hoặc bỏ qua để nhập mới."
                style={{ marginBottom: 16 }} />
              <Form.Item name="templateSampleId" label="Tìm mẫu đã có">
                <Select
                  showSearch allowClear placeholder="Gõ mã hoặc tên mẫu để tìm..."
                  filterOption={false} onSearch={handleSearchExisting}
                  onChange={(v) => v ? applyTemplate(v) : setSelectedTemplate(null)}
                  loading={searchingSamples}
                  notFoundContent={searchingSamples ? <Spin size="small" /> : 'Gõ ít nhất 2 ký tự để tìm'}
                >
                  {existingSamples.map((s: any) => (
                    <Select.Option key={s.id} value={s.id}>
                      <strong>{s.code}</strong> — {s.varietyName || s.localName || 'Chưa đặt tên'} {s.category?.name ? `(${s.category.name})` : ''}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              {selectedTemplate && (
                <Alert type="success" showIcon
                  message={`Kế thừa từ: ${selectedTemplate.code} — ${selectedTemplate.varietyName || selectedTemplate.localName}`}
                  description="Thông tin giống đã được điền tự động. Bạn chỉ cần nhập thông tin thu thập và số lượng."
                  style={{ marginBottom: 16 }} />
              )}
              <Divider />
            </>
          )}

          {/* THÔNG TIN GIỐNG */}
          <Divider orientation="left">Thông tin giống</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="categoryId" label="Nhóm giống" rules={[{ required: true, message: 'Vui lòng chọn nhóm giống' }]}>
                <TreeSelect placeholder="Chọn nhóm giống" treeData={buildCategoryTree(categories)}
                  showSearch treeDefaultExpandAll allowClear loading={loadingCategories}
                  onChange={(v: string) => setSelectedCategoryId(v)}
                  filterTreeNode={(input, option) => (option?.title as string)?.toLowerCase().includes(input.toLowerCase())}
                  notFoundContent={loadingCategories ? <Spin size="small" /> : 'Không có dữ liệu'} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="varietyId" label="Giống">
                <Select placeholder={selectedCategoryId ? 'Chọn giống' : 'Vui lòng chọn Nhóm giống trước'}
                  showSearch allowClear loading={loadingVarieties} disabled={!selectedCategoryId}
                  optionFilterProp="label" options={varieties.map(v => ({ value: v.id, label: v.name }))}
                  notFoundContent={loadingVarieties ? <Spin size="small" /> : 'Không có dữ liệu'} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="varietyName" label="Tên mẫu giống"><Input placeholder="Nhập tên mẫu giống" /></Form.Item></Col>
            <Col span={8}><Form.Item name="localName" label="Tên địa phương"><Input placeholder="Nhập tên địa phương" /></Form.Item></Col>
            <Col span={8}><Form.Item name="scientificName" label="Tên khoa học"><Input placeholder="Nhập tên khoa học" /></Form.Item></Col>
          </Row>

          {/* THÔNG TIN THU THẬP */}
          <Divider orientation="left">Thông tin thu thập</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="collectionDate" label="Ngày thu thập" rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="season" label="Mùa vụ">
                <Select placeholder="Chọn mùa vụ" allowClear options={seasonOptions} />
              </Form.Item>
            </Col>
          </Row>

          {/* NGUỒN CUNG CẤP */}
          <Divider orientation="left">Nguồn cung cấp & Người thu thập</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="providerId" label="Nguồn cung cấp">
                <Select placeholder="Chọn nguồn" showSearch allowClear loading={loadingProviders}
                  optionFilterProp="label" options={providers.map(p => ({ value: p.id, label: p.name }))}
                  notFoundContent={loadingProviders ? <Spin size="small" /> : 'Không có dữ liệu'} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="providerName" label="Tên nguồn (khác)">
                <Input placeholder="Nhập tên nguồn nếu không có trong DS" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="collectorId" label="Người thu thập">
                <Select placeholder="Chọn người thu thập" showSearch allowClear loading={loadingStaff}
                  optionFilterProp="label" options={staffList.map(s => ({ value: s.id, label: s.fullName }))}
                  notFoundContent={loadingStaff ? <Spin size="small" /> : 'Không có dữ liệu'} />
              </Form.Item>
            </Col>
          </Row>

          {/* THÔNG TIN MẪU */}
          <Divider orientation="left">Thông tin mẫu</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="initialQuantity" label="Số lượng thu nhận">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="Nhập số lượng" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="quantityUnit" label="Đơn vị" initialValue="gram">
                <Select>
                  <Select.Option value="gram">Gram</Select.Option>
                  <Select.Option value="kg">Kilogram</Select.Option>
                  <Select.Option value="hat">Hạt</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sampleCondition" label="Tình trạng mẫu">
                <Select placeholder="Chọn tình trạng" allowClear options={conditionOptions} />
              </Form.Item>
            </Col>
          </Row>

          {/* ẢNH ĐÍNH KÈM */}
          <Divider orientation="left">Ảnh đính kèm</Divider>
          <Form.Item name="attachments">
            <Dragger multiple listType="picture" fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)} beforeUpload={() => false}>
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">Nhấp hoặc kéo thả file vào đây</p>
            </Dragger>
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú"><TextArea rows={3} placeholder="Ghi chú thêm..." /></Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">{selectedRecord ? 'Cập nhật' : 'Tạo phiếu thu nhập'}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer xem chi tiết */}
      <Drawer title="Chi tiết mẫu giống" placement="right" width={650} open={isDetailOpen} onClose={() => setIsDetailOpen(false)}>
        {selectedRecord && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Mã mẫu">{(selectedRecord as any).code || '-'}</Descriptions.Item>
            <Descriptions.Item label="Nhóm giống">{selectedRecord.category?.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="Giống">{selectedRecord.variety?.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="Tên mẫu giống">{(selectedRecord as any).varietyName || '-'}</Descriptions.Item>
            <Descriptions.Item label="Tên địa phương">{(selectedRecord as any).localName || '-'}</Descriptions.Item>
            <Descriptions.Item label="Tên khoa học">{(selectedRecord as any).scientificName || '-'}</Descriptions.Item>
            <Descriptions.Item label="Ngày thu thập">{selectedRecord.collectionDate ? dayjs(selectedRecord.collectionDate).format('DD/MM/YYYY') : '-'}</Descriptions.Item>
            <Descriptions.Item label="Mùa vụ">{(selectedRecord as any).season || '-'}</Descriptions.Item>
            <Descriptions.Item label="Nguồn cung cấp">{selectedRecord.provider?.name || (selectedRecord as any).providerName || '-'}</Descriptions.Item>
            <Descriptions.Item label="Người thu thập">{(selectedRecord as any).collector?.fullName || '-'}</Descriptions.Item>
            <Descriptions.Item label="Số lượng ban đầu">{(selectedRecord as any).initialQuantity} {(selectedRecord as any).quantityUnit}</Descriptions.Item>
            <Descriptions.Item label="Số lượng hiện tại">{(selectedRecord as any).currentQuantity} {(selectedRecord as any).quantityUnit}</Descriptions.Item>
            <Descriptions.Item label="Tình trạng">{(selectedRecord as any).sampleCondition || '-'}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái"><Tag color={statusColors[selectedRecord.status]}>{statusLabels[selectedRecord.status]}</Tag></Descriptions.Item>
            <Descriptions.Item label="Ghi chú">{(selectedRecord as any).notes || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
