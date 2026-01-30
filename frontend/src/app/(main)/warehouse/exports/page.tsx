'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Typography,
  Tooltip,
  Tag,
  Modal,
  Form,
  Select,
  DatePicker,
  InputNumber,
  message,
  Drawer,
  Descriptions,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  SendOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { exportsService } from '@/services/warehouse.service';
import { warehousesService, exportReasonsService } from '@/services/catalog.service';
import { samplesService } from '@/services/samples.service';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// Map đơn vị chuẩn hóa sang nhãn hiển thị
const unitLabelMap: Record<string, string> = {
  gram: 'Gram',
  kg: 'Kg',
  hat: 'Hạt',
};

// Lấy đơn vị chuẩn hóa từ sample
const getSampleUnit = (sample: any): string => {
  const unit = sample?.quantityUnit || 'gram';
  const lower = unit.toLowerCase().trim();
  if (lower === 'g' || lower === 'gram') return 'gram';
  if (lower === 'kg' || lower === 'kilogram') return 'kg';
  if (lower === 'hat' || lower === 'hạt') return 'hat';
  return lower;
};

const statusColors: Record<string, string> = {
  DRAFT: 'default',
  PENDING_APPROVAL: 'processing',
  APPROVED: 'success',
  REJECTED: 'error',
  EXPORTED: 'cyan',
  CANCELLED: 'default',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Nháp',
  PENDING_APPROVAL: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  EXPORTED: 'Đã xuất',
  CANCELLED: 'Đã hủy',
};

export default function WarehouseExportsPage() {
  const [loading, setLoading] = useState(false);
  const [exports, setExports] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedExport, setSelectedExport] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [reasons, setReasons] = useState<any[]>([]);
  const [samples, setSamples] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const loadWarehouses = async () => {
    try {
      const res = await warehousesService.getAll({ page: 1, limit: 500 });
      setWarehouses(res.data || []);
    } catch (error) {
      console.error('Error loading warehouses:', error);
    }
  };

  const loadReasons = async () => {
    try {
      // exportReasonsService.getAll returns array directly (not paginated)
      const res = await exportReasonsService.getAll(true);
      setReasons(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error('Error loading reasons:', error);
    }
  };

  const loadSamples = async () => {
    try {
      const res = await samplesService.getAll({ page: 1, limit: 500 });
      setSamples(res.data || []);
    } catch (error) {
      console.error('Error loading samples:', error);
    }
  };

  const fetchExports = async () => {
    setLoading(true);
    try {
      const result = await exportsService.getAll({ page, limit, search, status: statusFilter as any });
      setExports(result.data || []);
      setTotal(result.meta?.total || 0);
    } catch (error: any) {
      console.error('Fetch exports error:', error);
      message.error('Không thể tải danh sách phiếu xuất');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
    loadReasons();
    loadSamples();
  }, []);

  useEffect(() => {
    fetchExports();
  }, [page, limit, search, statusFilter]);

  const handleCreate = async () => {
    setEditingId(null);
    form.resetFields();
    try {
      const { code } = await exportsService.generateCode();
      form.setFieldsValue({
        exportNumber: code,
        exportDate: dayjs(),
        items: [{}],
      });
    } catch (error) {
      form.setFieldsValue({
        exportDate: dayjs(),
        items: [{}],
      });
    }
    setIsModalOpen(true);
  };

  const handleEdit = async (record: any) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      exportDate: dayjs(record.exportDate),
      items: record.items?.map((item: any) => {
        const sample = samples.find((s) => s.id === item.sampleId);
        return {
          sampleId: item.sampleId,
          quantity: item.quantity,
          unit: sample ? getSampleUnit(sample) : (item.unit || 'gram'),
        };
      }) || [{}],
    });
    setIsModalOpen(true);
  };

  const handleView = async (record: any) => {
    try {
      const detail = await exportsService.getById(record.id);
      setSelectedExport(detail);
      setIsDetailOpen(true);
    } catch (error) {
      message.error('Không thể tải chi tiết phiếu');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await exportsService.delete(id);
      message.success('Đã xóa phiếu xuất');
      fetchExports();
    } catch (error) {
      message.error('Không thể xóa phiếu');
    }
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        exportDate: values.exportDate?.format('YYYY-MM-DD'),
      };

      if (editingId) {
        await exportsService.update(editingId, payload);
        message.success('Cập nhật phiếu xuất thành công');
      } else {
        await exportsService.create(payload);
        message.success('Tạo phiếu xuất thành công');
      }

      setIsModalOpen(false);
      form.resetFields();
      fetchExports();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitForApproval = async (id: string) => {
    try {
      await exportsService.submit(id);
      message.success('Đã gửi phiếu chờ duyệt');
      fetchExports();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể gửi duyệt');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await exportsService.approve(id);
      message.success('Đã duyệt phiếu xuất');
      fetchExports();
      setIsDetailOpen(false);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể duyệt phiếu');
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await exportsService.reject(id, reason);
      message.success('Đã từ chối phiếu xuất');
      fetchExports();
      setIsDetailOpen(false);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể từ chối phiếu');
    }
  };

  const columns = [
    {
      title: 'Số phiếu',
      dataIndex: 'exportNumber',
      key: 'exportNumber',
      width: 150,
    },
    {
      title: 'Kho',
      dataIndex: ['warehouse', 'name'],
      key: 'warehouse',
    },
    {
      title: 'Ngày xuất',
      dataIndex: 'exportDate',
      key: 'exportDate',
      width: 120,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Người nhận',
      dataIndex: 'recipientName',
      key: 'recipientName',
    },
    {
      title: 'Số mẫu',
      dataIndex: 'totalItems',
      key: 'totalItems',
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => (
        <Tag color={statusColors[status]}>{statusLabels[status] || status}</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 180,
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Xem">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          {record.status === 'DRAFT' && (
            <>
              <Tooltip title="Sửa">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                />
              </Tooltip>
              <Tooltip title="Gửi duyệt">
                <Button
                  type="text"
                  size="small"
                  icon={<SendOutlined />}
                  onClick={() => handleSubmitForApproval(record.id)}
                />
              </Tooltip>
              <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(record.id)}>
                <Tooltip title="Xóa">
                  <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                </Tooltip>
              </Popconfirm>
            </>
          )}
          {record.status === 'PENDING_APPROVAL' && (
            <>
              <Tooltip title="Duyệt">
                <Button
                  type="text"
                  size="small"
                  style={{ color: 'green' }}
                  icon={<CheckOutlined />}
                  onClick={() => handleApprove(record.id)}
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: 'Từ chối phiếu xuất',
                      content: (
                        <Input.TextArea
                          id="reject-reason"
                          placeholder="Lý do từ chối"
                          rows={3}
                        />
                      ),
                      onOk: () => {
                        const reason = (document.getElementById('reject-reason') as any)?.value;
                        handleReject(record.id, reason);
                      },
                    });
                  }}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Phiếu xuất kho</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Tạo phiếu xuất
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
          <Input
            placeholder="Tìm kiếm theo số phiếu..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
          <Select
            placeholder="Lọc theo trạng thái"
            style={{ width: 200 }}
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
          >
            {Object.entries(statusLabels).map(([k, v]) => (
              <Select.Option key={k} value={k}>{v}</Select.Option>
            ))}
          </Select>
        </div>
        <Table
          dataSource={exports}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} phiếu`,
            onChange: (p, l) => {
              setPage(p);
              setLimit(l);
            },
          }}
        />
      </Card>

      {/* Modal tạo/sửa */}
      <Modal
        title={editingId ? 'Sửa phiếu xuất kho' : 'Tạo phiếu xuất kho'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        width={900}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item
              name="exportNumber"
              label="Số phiếu"
              rules={[{ required: true, message: 'Vui lòng nhập số phiếu' }]}
            >
              <Input disabled={!!editingId} />
            </Form.Item>

            <Form.Item
              name="warehouseId"
              label="Kho xuất"
              rules={[{ required: true, message: 'Vui lòng chọn kho' }]}
            >
              <Select placeholder="Chọn kho" showSearch optionFilterProp="children">
                {warehouses.map((w) => (
                  <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="exportDate"
              label="Ngày xuất"
              rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item
              name="reasonId"
              label="Lý do xuất"
              rules={[{ required: true, message: 'Vui lòng chọn lý do' }]}
            >
              <Select placeholder="Chọn lý do" showSearch optionFilterProp="children">
                {reasons.map((r) => (
                  <Select.Option key={r.id} value={r.id}>{r.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="recipientName" label="Người/Đơn vị nhận">
              <Input placeholder="Tên người hoặc đơn vị nhận" />
            </Form.Item>

            <Form.Item name="recipientContact" label="Liên hệ">
              <Input placeholder="SĐT hoặc email" />
            </Form.Item>

            <Form.Item name="recipientAddress" label="Địa chỉ" style={{ gridColumn: 'span 2' }}>
              <Input placeholder="Địa chỉ người nhận" />
            </Form.Item>

            <Form.Item name="notes" label="Ghi chú">
              <Input.TextArea rows={1} />
            </Form.Item>
          </div>

          <Title level={5}>Danh sách mẫu xuất</Title>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Form.Item
                    key={key}
                    noStyle
                    shouldUpdate={(prev, curr) =>
                      prev?.items?.[name]?.sampleId !== curr?.items?.[name]?.sampleId
                    }
                  >
                    {() => {
                      const currentSampleId = form.getFieldValue(['items', name, 'sampleId']);
                      const currentSample = samples.find((s) => s.id === currentSampleId);
                      const sampleUnit = currentSample ? getSampleUnit(currentSample) : null;
                      const unitLabel = sampleUnit ? (unitLabelMap[sampleUnit] || sampleUnit) : '';
                      const maxStock = currentSample?.currentQuantity ?? undefined;

                      return (
                        <div style={{ marginBottom: 8 }}>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '2fr minmax(180px, 1.5fr) auto',
                              gap: 8,
                            }}
                          >
                            <Form.Item
                              {...restField}
                              name={[name, 'sampleId']}
                              rules={[{ required: true, message: 'Chọn mẫu' }]}
                              style={{ marginBottom: 0 }}
                            >
                              <Select
                                placeholder="Chọn mẫu"
                                showSearch
                                optionFilterProp="children"
                                onChange={(sampleId: string) => {
                                  const selected = samples.find((s) => s.id === sampleId);
                                  if (selected) {
                                    const unit = getSampleUnit(selected);
                                    form.setFieldValue(['items', name, 'unit'], unit);
                                    form.setFieldValue(['items', name, 'quantity'], undefined);
                                  }
                                }}
                              >
                                {samples.map((s) => (
                                  <Select.Option key={s.id} value={s.id}>
                                    {s.code} - {s.varietyName || s.localName} (Tồn: {s.currentQuantity || 0} {unitLabelMap[getSampleUnit(s)] || s.quantityUnit})
                                  </Select.Option>
                                ))}
                              </Select>
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, 'quantity']}
                              rules={[
                                { required: true, message: 'Nhập SL' },
                                {
                                  validator: (_, value) => {
                                    if (!value || maxStock == null) return Promise.resolve();
                                    if (value > maxStock) {
                                      return Promise.reject(`Tối đa ${maxStock} ${unitLabel}`);
                                    }
                                    return Promise.resolve();
                                  },
                                },
                              ]}
                              style={{ marginBottom: 0 }}
                            >
                              <InputNumber
                                placeholder="Số lượng"
                                min={0}
                                max={maxStock}
                                style={{ width: '100%' }}
                                addonAfter={unitLabel || 'ĐV'}
                              />
                            </Form.Item>

                            <Form.Item {...restField} name={[name, 'unit']} initialValue="gram" hidden>
                              <Select>
                                <Select.Option value="gram">Gram</Select.Option>
                                <Select.Option value="kg">Kg</Select.Option>
                                <Select.Option value="hat">Hạt</Select.Option>
                              </Select>
                            </Form.Item>

                            <Button
                              type="text"
                              danger
                              icon={<MinusCircleOutlined />}
                              onClick={() => remove(name)}
                              style={{ marginTop: 4 }}
                            />
                          </div>
                          {currentSample && maxStock != null && (
                            <div style={{ fontSize: 12, color: '#1890ff', marginTop: 2, paddingLeft: 4 }}>
                              Tồn kho: <strong>{maxStock}</strong> {unitLabel}
                            </div>
                          )}
                        </div>
                      );
                    }}
                  </Form.Item>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Thêm mẫu
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* Drawer chi tiết */}
      <Drawer
        title="Chi tiết phiếu xuất kho"
        placement="right"
        width={700}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        extra={
          selectedExport?.status === 'PENDING_APPROVAL' && (
            <Space>
              <Button type="primary" onClick={() => handleApprove(selectedExport.id)}>
                Duyệt
              </Button>
              <Button
                danger
                onClick={() => {
                  Modal.confirm({
                    title: 'Từ chối phiếu xuất',
                    content: (
                      <Input.TextArea id="reject-reason-drawer" placeholder="Lý do từ chối" rows={3} />
                    ),
                    onOk: () => {
                      const reason = (document.getElementById('reject-reason-drawer') as any)?.value;
                      handleReject(selectedExport.id, reason);
                    },
                  });
                }}
              >
                Từ chối
              </Button>
            </Space>
          )
        }
      >
        {selectedExport && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Số phiếu">{selectedExport.exportNumber}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={statusColors[selectedExport.status]}>
                  {statusLabels[selectedExport.status]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Kho">{selectedExport.warehouse?.name}</Descriptions.Item>
              <Descriptions.Item label="Ngày xuất">
                {dayjs(selectedExport.exportDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Người nhận">
                {selectedExport.recipientName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Liên hệ">
                {selectedExport.recipientContact || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>
                {selectedExport.recipientAddress || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Người tạo">
                {selectedExport.creator?.fullName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {dayjs(selectedExport.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              {selectedExport.status === 'REJECTED' && (
                <Descriptions.Item label="Lý do từ chối" span={2}>
                  <Text type="danger">{selectedExport.rejectionReason || '-'}</Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Ghi chú" span={2}>
                {selectedExport.notes || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Title level={5}>Danh sách mẫu ({selectedExport.items?.length || 0})</Title>
            <Table
              dataSource={selectedExport.items || []}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                {
                  title: 'Mã mẫu',
                  dataIndex: ['sample', 'code'],
                  key: 'code',
                },
                {
                  title: 'Tên giống',
                  key: 'name',
                  render: (_: any, record: any) =>
                    record.sample?.varietyName || record.sample?.localName || '-',
                },
                {
                  title: 'Số lượng',
                  key: 'quantity',
                  align: 'right' as const,
                  render: (_: any, record: any) => `${record.quantity} ${unitLabelMap[record.unit] || record.unit || 'gram'}`,
                },
              ]}
            />
          </>
        )}
      </Drawer>
    </div>
  );
}
