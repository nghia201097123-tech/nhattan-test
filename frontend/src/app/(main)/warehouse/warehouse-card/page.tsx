'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Typography,
  Select,
  Drawer,
  Descriptions,
  Tag,
  Timeline,
  message,
  Empty,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  ImportOutlined,
  ExportOutlined,
  SwapOutlined,
  SettingOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { inventoryService } from '@/services/warehouse.service';
import { warehousesService } from '@/services/catalog.service';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const transactionTypeColors: Record<string, string> = {
  IMPORT: 'green',
  EXPORT: 'red',
  TRANSFER_IN: 'blue',
  TRANSFER_OUT: 'orange',
  ADJUSTMENT: 'purple',
};

const transactionTypeLabels: Record<string, string> = {
  IMPORT: 'Nhập kho',
  EXPORT: 'Xuất kho',
  TRANSFER_IN: 'Nhận chuyển kho',
  TRANSFER_OUT: 'Gửi chuyển kho',
  ADJUSTMENT: 'Điều chỉnh',
};

const transactionTypeIcons: Record<string, React.ReactNode> = {
  IMPORT: <ImportOutlined style={{ color: '#52c41a' }} />,
  EXPORT: <ExportOutlined style={{ color: '#ff4d4f' }} />,
  TRANSFER_IN: <SwapOutlined style={{ color: '#1890ff' }} />,
  TRANSFER_OUT: <SwapOutlined style={{ color: '#faad14' }} />,
  ADJUSTMENT: <SettingOutlined style={{ color: '#722ed1' }} />,
};

// Build full location path: Tủ - Kệ - Ngăn
const getLocationPath = (location: any): string | null => {
  if (!location) return null;
  const parts: string[] = [];
  if (location.parent?.parent?.name) parts.push(location.parent.parent.name);
  if (location.parent?.name) parts.push(location.parent.name);
  parts.push(location.name);
  return parts.join(' - ');
};

export default function WarehouseCardPage() {
  const [loading, setLoading] = useState(false);
  const [samples, setSamples] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [warehouseId, setWarehouseId] = useState<string | undefined>();

  const [warehouses, setWarehouses] = useState<any[]>([]);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<any>(null);
  const [stockCard, setStockCard] = useState<any[]>([]);
  const [stockCardLoading, setStockCardLoading] = useState(false);

  const loadWarehouses = async () => {
    try {
      const res = await warehousesService.getAll({ page: 1, limit: 500 });
      setWarehouses(res.data || []);
    } catch (error) {
      console.error('Error loading warehouses:', error);
    }
  };

  const fetchSamples = async () => {
    setLoading(true);
    try {
      const result = await inventoryService.getWarehouseCardList({
        page,
        limit,
        search,
        warehouseId,
      });
      setSamples(result.data || []);
      setTotal(result.meta?.total || 0);
    } catch (error: any) {
      console.error('Fetch samples error:', error);
      message.error('Không thể tải danh sách mẫu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  useEffect(() => {
    fetchSamples();
  }, [page, limit, search, warehouseId]);

  const handleViewStockCard = async (sample: any) => {
    setSelectedSample(sample);
    setIsDetailOpen(true);
    setStockCardLoading(true);

    try {
      const data = await inventoryService.getStockCard(
        sample.sampleId,
        warehouseId,
      );
      setStockCard(data || []);
    } catch (error) {
      console.error('Error loading stock card:', error);
      message.error('Không thể tải thẻ kho');
      setStockCard([]);
    } finally {
      setStockCardLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã mẫu',
      dataIndex: 'sampleCode',
      key: 'code',
      width: 140,
    },
    {
      title: 'Tên giống',
      dataIndex: 'varietyName',
      key: 'varietyName',
    },
    {
      title: 'Loại',
      dataIndex: 'categoryName',
      key: 'category',
    },
    {
      title: 'Kho hiện tại',
      dataIndex: 'warehouseName',
      key: 'warehouse',
      render: (name: string) => name || '-',
    },
    {
      title: 'Vị trí',
      dataIndex: 'locationName',
      key: 'location',
      render: (name: string) => name || '-',
    },
    {
      title: 'Số lượng hiện tại',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 140,
      align: 'right' as const,
      render: (qty: number, record: any) => (
        <span style={{ fontWeight: 'bold' }}>
          {Number(qty || 0).toFixed(2)} {record.unit || 'g'}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 130,
      render: (_: any, record: any) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewStockCard(record)}
        >
          Xem thẻ kho
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Thẻ kho</Title>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
          <Input
            placeholder="Tìm kiếm theo mã hoặc tên giống..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
          <Select
            placeholder="Lọc theo kho"
            style={{ width: 200 }}
            allowClear
            value={warehouseId}
            onChange={(val) => {
              setWarehouseId(val);
              setPage(1);
            }}
          >
            {warehouses.map(w => (
              <Select.Option key={w.id} value={w.id}>{w.name}</Select.Option>
            ))}
          </Select>
        </div>

        <Table
          dataSource={samples}
          columns={columns}
          rowKey="sampleId"
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

      {/* Drawer chi tiết thẻ kho */}
      <Drawer
        title="Thẻ kho chi tiết"
        placement="right"
        width={700}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      >
        {selectedSample && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Mã mẫu">{selectedSample.sampleCode}</Descriptions.Item>
              <Descriptions.Item label="Tên giống">
                {selectedSample.varietyName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Loại">{selectedSample.categoryName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Kho hiện tại">{selectedSample.warehouseName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Vị trí">{selectedSample.locationName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Số lượng hiện tại">
                <Text strong style={{ fontSize: 16 }}>
                  {Number(selectedSample.currentStock || 0).toFixed(2)} {selectedSample.unit || 'g'}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Card title="Lịch sử biến động" loading={stockCardLoading}>
              {stockCard.length > 0 ? (
                <Timeline
                  items={stockCard.map((tx) => ({
                    color: transactionTypeColors[tx.transactionType] || 'gray',
                    dot: transactionTypeIcons[tx.transactionType],
                    children: (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <Tag color={transactionTypeColors[tx.transactionType]}>
                              {transactionTypeLabels[tx.transactionType] || tx.transactionType}
                            </Tag>
                            <Text type="secondary" style={{ marginLeft: 8 }}>
                              {dayjs(tx.transactionDate).format('DD/MM/YYYY')}
                            </Text>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div>
                              <Text
                                strong
                                style={{
                                  color: tx.quantity >= 0 ? '#52c41a' : '#ff4d4f',
                                }}
                              >
                                {tx.quantity >= 0 ? '+' : ''}{tx.quantity} {tx.unit}
                              </Text>
                            </div>
                            <div>
                              <Text type="secondary">Tồn: {tx.balance} {tx.unit}</Text>
                            </div>
                          </div>
                        </div>
                        {(tx.warehouse?.name || tx.location) && (
                          <div style={{ marginTop: 4 }}>
                            <EnvironmentOutlined style={{ color: '#999', marginRight: 4 }} />
                            <Text type="secondary">
                              {tx.warehouse?.name}{getLocationPath(tx.location) ? ` - ${getLocationPath(tx.location)}` : ''}
                            </Text>
                          </div>
                        )}
                        {tx.notes && (
                          <div style={{ marginTop: 4 }}>
                            <Text type="secondary" italic>{tx.notes}</Text>
                          </div>
                        )}
                        {tx.referenceNumber && (
                          <div>
                            <Text type="secondary">Số CT: {tx.referenceNumber}</Text>
                          </div>
                        )}
                      </div>
                    ),
                  }))}
                />
              ) : (
                <Empty description="Chưa có lịch sử biến động" />
              )}
            </Card>
          </>
        )}
      </Drawer>
    </div>
  );
}
