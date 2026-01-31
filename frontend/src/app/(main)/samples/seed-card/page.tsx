'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Typography,
  Tooltip,
  Modal,
  Drawer,
  Descriptions,
  Progress,
  Tag,
  Timeline,
  Statistic,
  Tabs,
  message,
  Checkbox,
  Row,
  Col,
  Form,
  InputNumber,
  Divider,
  Spin,
  Empty,
} from 'antd';
import {
  SearchOutlined,
  PrinterOutlined,
  DownloadOutlined,
  EyeOutlined,
  QrcodeOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  HistoryOutlined,
  ExperimentOutlined,
  BranchesOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';
import { seedCardService, samplesService } from '@/services/samples.service';
import { SeedCardData, SeedCardConfig } from '@/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const defaultConfig: SeedCardConfig = {
  showCode: true,
  showVarietyName: true,
  showCategory: true,
  showCollectionDate: true,
  showLocation: true,
  showProvider: true,
  showScientificName: false,
  showGerminationRate: true,
  showExpiryDate: true,
  showStorageLocation: false,
  showQRCode: true,
  qrCodeSize: 120,
  cardTitle: 'THẺ GIỐNG',
  cardWidth: 85,
  cardHeight: 54,
};

// Component thẻ giống để in
const SeedCard = ({ data, config, forPrint = false }: { data: SeedCardData; config: SeedCardConfig; forPrint?: boolean }) => {
  const scale = forPrint ? 1 : 3.78;
  const unit = forPrint ? 'mm' : 'px';
  const cardWidth = config.cardWidth || 85;
  const cardHeight = config.cardHeight || 54;
  const qrCodeSize = config.qrCodeSize || 120;
  const width = forPrint ? cardWidth : cardWidth * scale;
  const height = forPrint ? cardHeight : cardHeight * scale;

  return (
    <div
      style={{
        width: `${width}${unit}`,
        minHeight: `${height}${unit}`,
        border: '2px solid #000',
        padding: forPrint ? '4mm' : '16px',
        fontFamily: 'Arial, sans-serif',
        fontSize: forPrint ? '9pt' : '14px',
        display: 'flex',
        flexDirection: 'column',
        pageBreakInside: 'avoid',
        backgroundColor: '#fff',
        boxSizing: 'border-box',
        borderRadius: '6px',
      }}
    >
      <div style={{
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: forPrint ? '11pt' : '18px',
        marginBottom: forPrint ? '3mm' : '12px',
        borderBottom: '2px solid #333',
        paddingBottom: forPrint ? '2mm' : '8px'
      }}>
        {config.cardTitle}
      </div>

      <div style={{ display: 'flex', flex: 1, gap: forPrint ? '4mm' : '16px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: '1.6' }}>
          {config.showCode && <div style={{ marginBottom: forPrint ? '1mm' : '6px' }}><strong>Mã:</strong> {data.code}</div>}
          {config.showVarietyName && <div style={{ marginBottom: forPrint ? '1mm' : '6px' }}><strong>Giống:</strong> {data.varietyName}</div>}
          {config.showCategory && <div style={{ marginBottom: forPrint ? '1mm' : '6px' }}><strong>Loại:</strong> {data.categoryName}</div>}
          {config.showScientificName && data.scientificName && <div style={{ marginBottom: forPrint ? '1mm' : '6px' }}><strong>Tên KH:</strong> <em>{data.scientificName}</em></div>}
          {config.showCollectionDate && <div style={{ marginBottom: forPrint ? '1mm' : '6px' }}><strong>Thu thập:</strong> {dayjs(data.collectionDate).format('DD/MM/YYYY')}</div>}
          {config.showLocation && data.location && <div style={{ marginBottom: forPrint ? '1mm' : '6px' }}><strong>Địa điểm:</strong> {data.location}</div>}
          {config.showProvider && data.providerName && <div style={{ marginBottom: forPrint ? '1mm' : '6px' }}><strong>Nguồn:</strong> {data.providerName}</div>}
          {config.showGerminationRate && data.germinationRate !== undefined && <div style={{ marginBottom: forPrint ? '1mm' : '6px' }}><strong>Nảy mầm:</strong> {data.germinationRate}%</div>}
          {config.showExpiryDate && data.expiryDate && <div style={{ marginBottom: forPrint ? '1mm' : '6px' }}><strong>Hết hạn:</strong> {dayjs(data.expiryDate).format('DD/MM/YYYY')}</div>}
          {config.showStorageLocation && data.storageLocation && <div style={{ marginBottom: forPrint ? '1mm' : '6px' }}><strong>Vị trí:</strong> {data.storageLocation}</div>}
        </div>

        {config.showQRCode && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '2px dashed #ccc', paddingLeft: forPrint ? '3mm' : '16px' }}>
            <QRCodeSVG value={data.qrCodeData} size={forPrint ? qrCodeSize * 0.7 : qrCodeSize} />
          </div>
        )}
      </div>
    </div>
  );
};

// Component để in nhiều thẻ
const PrintableCards = ({ cards, config, forPrint = false }: { cards: SeedCardData[]; config: SeedCardConfig; forPrint?: boolean }) => (
  <div style={{ padding: forPrint ? '10mm' : '20px' }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: forPrint ? '5mm' : '20px', justifyContent: 'center' }}>
      {cards.map((card) => (
        <SeedCard key={card.id} data={card} config={config} forPrint={forPrint} />
      ))}
    </div>
  </div>
);

// Helper: transaction type label & color
const transactionTypeMap: Record<string, { label: string; color: string }> = {
  IMPORT: { label: 'Nhập kho', color: 'green' },
  EXPORT: { label: 'Xuất kho', color: 'red' },
  TRANSFER_IN: { label: 'Chuyển đến', color: 'blue' },
  TRANSFER_OUT: { label: 'Chuyển đi', color: 'orange' },
};

// Helper: evaluation result tag
const evalResultTag = (result?: string) => {
  if (!result) return <Tag>Chưa có</Tag>;
  const map: Record<string, { color: string; label: string }> = {
    PASS: { color: 'green', label: 'Đạt' },
    FAIL: { color: 'red', label: 'Không đạt' },
    CONDITIONAL: { color: 'orange', label: 'Có điều kiện' },
  };
  const item = map[result] || { color: 'default', label: result };
  return <Tag color={item.color}>{item.label}</Tag>;
};

// Helper: propagation status tag
const propagationStatusTag = (status?: string) => {
  if (!status) return null;
  const map: Record<string, { color: string; label: string }> = {
    PLANNED: { color: 'default', label: 'Kế hoạch' },
    IN_PROGRESS: { color: 'processing', label: 'Đang thực hiện' },
    HARVESTED: { color: 'warning', label: 'Đã thu hoạch' },
    COMPLETED: { color: 'success', label: 'Hoàn thành' },
    CANCELLED: { color: 'error', label: 'Đã hủy' },
  };
  const item = map[status] || { color: 'default', label: status };
  return <Tag color={item.color}>{item.label}</Tag>;
};

export default function SeedCardPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SeedCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [config, setConfig] = useState<SeedCardConfig>(defaultConfig);
  const [configVisible, setConfigVisible] = useState(false);
  const [previewData, setPreviewData] = useState<SeedCardData[]>([]);
  const [form] = Form.useForm();

  // Drawer state
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [fullInfo, setFullInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('info');

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'Thẻ giống',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await seedCardService.getSamplesForPrint({ page, limit, search });
      setData(result.data);
      setTotal(result.meta.total);
    } catch (error) {
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, limit, search]);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const cfg = await seedCardService.getDefaultConfig();
        setConfig({ ...defaultConfig, ...cfg });
        form.setFieldsValue({ ...defaultConfig, ...cfg });
      } catch {
        form.setFieldsValue(defaultConfig);
      }
    };
    loadConfig();
  }, []);

  // Open detail drawer
  const handleViewDetail = async (record: SeedCardData) => {
    setDrawerVisible(true);
    setDrawerLoading(true);
    setActiveTab('info');
    setFullInfo(null);
    try {
      const info = await samplesService.getFullInfo(record.id);
      setFullInfo({ ...info, _cardData: record });
    } catch {
      message.error('Không thể tải thông tin chi tiết');
    } finally {
      setDrawerLoading(false);
    }
  };

  const handlePrintSingle = (record: SeedCardData) => {
    setPreviewData([record]);
    setTimeout(() => handlePrint(), 100);
  };

  const handlePrintSelected = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một mẫu');
      return;
    }
    const selected = data.filter((d) => selectedRowKeys.includes(d.id));
    setPreviewData(selected);
    setTimeout(() => handlePrint(), 100);
  };

  const handleExportQRCode = async (record: SeedCardData) => {
    try {
      const svgElement = document.querySelector(`#qr-${record.id} svg`);
      if (!svgElement) {
        message.error('Không tìm thấy QR Code');
        return;
      }
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        img.onload = () => {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, 200, 200);
          ctx.drawImage(img, 0, 0, 200, 200);
          canvas.toBlob((b) => {
            if (b) {
              const link = document.createElement('a');
              link.href = URL.createObjectURL(b);
              link.download = `QR_${record.code}.png`;
              link.click();
            }
          }, 'image/png');
          URL.revokeObjectURL(url);
        };
        img.src = url;
      }
      message.success('Đang xuất QR Code...');
    } catch {
      message.error('Không thể xuất QR Code');
    }
  };

  const handleConfigSubmit = (values: SeedCardConfig) => {
    setConfig(values);
    setConfigVisible(false);
    message.success('Đã cập nhật cấu hình thẻ');
  };

  // Render quantity summary section
  const renderQuantitySummary = () => {
    if (!fullInfo?.quantitySummary) return <Empty description="Chưa có dữ liệu số lượng" />;
    const qs = fullInfo.quantitySummary;
    const importPercent = qs.initialQuantity > 0
      ? Math.round((qs.totalImported / qs.initialQuantity) * 100)
      : 0;

    return (
      <div>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card size="small">
              <Statistic title="SL ban đầu" value={qs.initialQuantity} suffix={qs.unit} valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title="Đã nhập kho" value={qs.totalImported} suffix={qs.unit} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title="Đã xuất kho" value={qs.totalExported} suffix={qs.unit} valueStyle={{ color: '#ff4d4f' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title="Tồn kho hiện tại" value={qs.currentStock} suffix={qs.unit} valueStyle={{ color: '#722ed1' }} />
            </Card>
          </Col>
        </Row>
        <div style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Text strong>Tiến độ nhập kho:</Text>
              <Progress
                percent={importPercent}
                format={() => `${qs.totalImported}/${qs.initialQuantity} ${qs.unit}`}
                status={importPercent >= 100 ? 'success' : 'active'}
              />
            </Col>
            <Col span={12}>
              <Text strong>Còn lại có thể nhập:</Text>
              <div style={{ marginTop: 8 }}>
                <Tag color={qs.remainingForImport > 0 ? 'blue' : 'default'} style={{ fontSize: 14, padding: '4px 12px' }}>
                  {qs.remainingForImport} {qs.unit}
                </Tag>
              </div>
            </Col>
          </Row>
        </div>
        {(qs.totalTransferIn > 0 || qs.totalTransferOut > 0) && (
          <div style={{ marginTop: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Text type="secondary">Chuyển đến: <Text strong>{qs.totalTransferIn} {qs.unit}</Text></Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Chuyển đi: <Text strong>{qs.totalTransferOut} {qs.unit}</Text></Text>
              </Col>
            </Row>
          </div>
        )}
      </div>
    );
  };

  // Render warehouse history
  const renderWarehouseHistory = () => {
    const transactions = fullInfo?.warehouseHistory || [];
    if (transactions.length === 0) return <Empty description="Chưa có lịch sử kho" />;

    const historyColumns = [
      {
        title: 'Ngày',
        dataIndex: 'transactionDate',
        key: 'date',
        width: 150,
        render: (d: string) => d ? dayjs(d).format('DD/MM/YYYY HH:mm') : '-',
      },
      {
        title: 'Loại',
        dataIndex: 'transactionType',
        key: 'type',
        width: 120,
        render: (type: string) => {
          const item = transactionTypeMap[type] || { label: type, color: 'default' };
          return <Tag color={item.color}>{item.label}</Tag>;
        },
      },
      {
        title: 'Số lượng',
        dataIndex: 'quantity',
        key: 'quantity',
        width: 100,
        render: (val: number) => Math.abs(Number(val)),
      },
      {
        title: 'Kho',
        key: 'warehouse',
        render: (_: any, record: any) => record.warehouse?.name || '-',
      },
      {
        title: 'Ghi chú',
        dataIndex: 'notes',
        key: 'notes',
        ellipsis: true,
      },
    ];

    return (
      <Table
        dataSource={transactions}
        columns={historyColumns}
        rowKey="id"
        size="small"
        pagination={transactions.length > 10 ? { pageSize: 10 } : false}
      />
    );
  };

  // Render evaluations
  const renderEvaluations = () => {
    const evaluations = fullInfo?.evaluations || [];
    if (evaluations.length === 0) return <Empty description="Chưa có đánh giá" />;

    return (
      <Timeline
        items={evaluations.map((ev: any) => ({
          color: ev.overallResult === 'PASS' ? 'green' : ev.overallResult === 'FAIL' ? 'red' : 'blue',
          children: (
            <div>
              <div style={{ marginBottom: 4 }}>
                <Text strong>{dayjs(ev.evaluationDate).format('DD/MM/YYYY')}</Text>
                {' '}{evalResultTag(ev.overallResult)}
              </div>
              {ev.germinationRate !== undefined && ev.germinationRate !== null && (
                <div><Text type="secondary">Tỷ lệ nảy mầm: </Text><Text strong>{ev.germinationRate}%</Text></div>
              )}
              {ev.evaluator && <div><Text type="secondary">Người đánh giá: </Text>{ev.evaluator.fullName}</div>}
              {ev.conclusion && <div><Text type="secondary">Kết luận: </Text>{ev.conclusion}</div>}
              {ev.recommendations && <div><Text type="secondary">Đề xuất: </Text>{ev.recommendations}</div>}
            </div>
          ),
        }))}
      />
    );
  };

  // Render propagations
  const renderPropagations = () => {
    const propagations = fullInfo?.propagations || [];
    if (propagations.length === 0) return <Empty description="Chưa có nhân giống" />;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {propagations.map((p: any) => (
          <Card key={p.id} size="small" title={<Space>{p.code || p.name || 'Đợt nhân giống'}{propagationStatusTag(p.status)}</Space>}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Ngày bắt đầu">{dayjs(p.startDate).format('DD/MM/YYYY')}</Descriptions.Item>
              <Descriptions.Item label="Dự kiến kết thúc">{p.expectedEndDate ? dayjs(p.expectedEndDate).format('DD/MM/YYYY') : '-'}</Descriptions.Item>
              <Descriptions.Item label="SL ban đầu">{p.initialQuantity} {p.initialUnit}</Descriptions.Item>
              <Descriptions.Item label="SL thu hoạch">{p.harvestQuantity != null ? `${p.harvestQuantity} ${p.harvestUnit}` : '-'}</Descriptions.Item>
              <Descriptions.Item label="Phương pháp">{p.propagationMethod || '-'}</Descriptions.Item>
              <Descriptions.Item label="Tiến độ"><Progress percent={p.progress || 0} size="small" /></Descriptions.Item>
              {p.propagator && <Descriptions.Item label="Người thực hiện">{p.propagator.fullName}</Descriptions.Item>}
              {p.qualityRating && <Descriptions.Item label="Chất lượng">{p.qualityRating}</Descriptions.Item>}
            </Descriptions>
            {p.notes && <div style={{ marginTop: 8 }}><Text type="secondary">Ghi chú: {p.notes}</Text></div>}
          </Card>
        ))}
      </div>
    );
  };

  const columns = [
    { title: 'Mã mẫu', dataIndex: 'code', key: 'code', width: 130 },
    { title: 'Tên giống', dataIndex: 'varietyName', key: 'varietyName' },
    { title: 'Loại cây', dataIndex: 'categoryName', key: 'categoryName' },
    {
      title: 'Ngày thu thập',
      dataIndex: 'collectionDate',
      key: 'collectionDate',
      width: 120,
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Nguồn gốc',
      dataIndex: 'providerName',
      key: 'providerName',
      ellipsis: true,
    },
    {
      title: 'Nảy mầm',
      dataIndex: 'germinationRate',
      key: 'germinationRate',
      width: 100,
      render: (val: number) => val != null ? `${val}%` : '-',
    },
    {
      title: 'QR Code',
      key: 'qrCode',
      width: 80,
      render: (_: any, record: SeedCardData) => (
        <div id={`qr-${record.id}`}>
          <QRCodeSVG value={record.qrCodeData} size={40} />
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 180,
      render: (_: any, record: SeedCardData) => (
        <Space size="small">
          <Tooltip title="Xem hồ sơ">
            <Button type="text" size="small" icon={<InfoCircleOutlined />} onClick={() => handleViewDetail(record)} />
          </Tooltip>
          <Tooltip title="In thẻ">
            <Button type="text" size="small" icon={<PrinterOutlined />} onClick={() => handlePrintSingle(record)} />
          </Tooltip>
          <Tooltip title="Xuất QR Code">
            <Button type="text" size="small" icon={<DownloadOutlined />} onClick={() => handleExportQRCode(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]),
  };

  // Drawer tabs
  const drawerTabs = [
    {
      key: 'info',
      label: <span><InfoCircleOutlined /> Thông tin</span>,
      children: fullInfo ? (
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Mã mẫu">{fullInfo.code}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={fullInfo.status === 'IN_STORAGE' ? 'green' : fullInfo.status === 'COLLECTED' ? 'blue' : 'default'}>
              {fullInfo.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Tên giống">{fullInfo.varietyName || fullInfo.variety?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="Loại cây">{fullInfo.category?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="Tên khoa học">{fullInfo.scientificName || '-'}</Descriptions.Item>
          <Descriptions.Item label="Tên địa phương">{fullInfo.localName || '-'}</Descriptions.Item>
          <Descriptions.Item label="Ngày thu thập">{fullInfo.collectionDate ? dayjs(fullInfo.collectionDate).format('DD/MM/YYYY') : '-'}</Descriptions.Item>
          <Descriptions.Item label="Năm thu thập">{fullInfo.collectionYear || '-'}</Descriptions.Item>
          <Descriptions.Item label="Vụ mùa">{fullInfo.season || '-'}</Descriptions.Item>
          <Descriptions.Item label="Địa điểm">{fullInfo.location?.name || fullInfo.locationDetail || '-'}</Descriptions.Item>
          <Descriptions.Item label="Nguồn cung cấp">{fullInfo.provider?.name || fullInfo.providerName || '-'}</Descriptions.Item>
          <Descriptions.Item label="Người thu thập">{fullInfo.collector?.fullName || '-'}</Descriptions.Item>
          <Descriptions.Item label="SL ban đầu">{fullInfo.initialQuantity ? `${fullInfo.initialQuantity} ${fullInfo.quantityUnit || 'gram'}` : '-'}</Descriptions.Item>
          <Descriptions.Item label="Tình trạng mẫu">{fullInfo.sampleCondition || '-'}</Descriptions.Item>
          <Descriptions.Item label="Kho hiện tại">{fullInfo.currentWarehouse?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="Vị trí lưu trữ">{fullInfo.currentLocation?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="Ngày nhập kho">{fullInfo.storageDate ? dayjs(fullInfo.storageDate).format('DD/MM/YYYY') : '-'}</Descriptions.Item>
          <Descriptions.Item label="Hạn sử dụng">{fullInfo.expiryDate ? dayjs(fullInfo.expiryDate).format('DD/MM/YYYY') : '-'}</Descriptions.Item>
          <Descriptions.Item label="Tỷ lệ nảy mầm">{fullInfo.lastGerminationRate != null ? `${fullInfo.lastGerminationRate}%` : '-'}</Descriptions.Item>
          <Descriptions.Item label="Đánh giá tiếp theo">{fullInfo.nextEvaluationDate ? dayjs(fullInfo.nextEvaluationDate).format('DD/MM/YYYY') : '-'}</Descriptions.Item>
          {fullInfo.morphology && <Descriptions.Item label="Hình thái" span={2}>{fullInfo.morphology}</Descriptions.Item>}
          {fullInfo.characteristics && <Descriptions.Item label="Đặc tính" span={2}>{fullInfo.characteristics}</Descriptions.Item>}
          {fullInfo.notes && <Descriptions.Item label="Ghi chú" span={2}>{fullInfo.notes}</Descriptions.Item>}
        </Descriptions>
      ) : null,
    },
    {
      key: 'quantity',
      label: <span><DatabaseOutlined /> Số lượng</span>,
      children: renderQuantitySummary(),
    },
    {
      key: 'history',
      label: <span><HistoryOutlined /> Lịch sử kho ({fullInfo?.warehouseHistory?.length || 0})</span>,
      children: renderWarehouseHistory(),
    },
    {
      key: 'evaluations',
      label: <span><ExperimentOutlined /> Đánh giá ({fullInfo?.evaluations?.length || 0})</span>,
      children: renderEvaluations(),
    },
    {
      key: 'propagations',
      label: <span><BranchesOutlined /> Nhân giống ({fullInfo?.propagations?.length || 0})</span>,
      children: renderPropagations(),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Thẻ giống & Hồ sơ mẫu</Title>
        <Space>
          <Button icon={<SettingOutlined />} onClick={() => setConfigVisible(true)}>
            Tùy chỉnh thẻ
          </Button>
          <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrintSelected} disabled={selectedRowKeys.length === 0}>
            In thẻ ({selectedRowKeys.length})
          </Button>
        </Space>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm theo mã hoặc tên giống..."
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
          rowSelection={rowSelection}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} mẫu`,
            onChange: (p, l) => { setPage(p); setLimit(l); },
          }}
        />
      </Card>

      {/* Drawer hồ sơ chi tiết */}
      <Drawer
        title={
          fullInfo ? (
            <Space>
              <span>Hồ sơ mẫu: {fullInfo.code}</span>
              <Tag color="blue">{fullInfo.varietyName || fullInfo.variety?.name}</Tag>
            </Space>
          ) : 'Hồ sơ mẫu'
        }
        placement="right"
        width={720}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        extra={
          fullInfo?._cardData ? (
            <Space>
              <Button
                icon={<PrinterOutlined />}
                onClick={() => handlePrintSingle(fullInfo._cardData)}
              >
                In thẻ
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => handleExportQRCode(fullInfo._cardData)}
              >
                Xuất QR
              </Button>
            </Space>
          ) : null
        }
      >
        {drawerLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" tip="Đang tải thông tin..." />
          </div>
        ) : fullInfo ? (
          <div>
            {/* QR Code + thẻ preview nhỏ ở đầu */}
            <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
              <Row gutter={16} align="middle">
                <Col>
                  <QRCodeSVG value={fullInfo._cardData?.qrCodeData || fullInfo.code} size={80} />
                </Col>
                <Col flex={1}>
                  <div><Text strong style={{ fontSize: 18 }}>{fullInfo.varietyName || fullInfo.variety?.name}</Text></div>
                  <div><Text type="secondary">Mã: {fullInfo.code}</Text></div>
                  <div><Text type="secondary">Loại: {fullInfo.category?.name || '-'}</Text></div>
                  {fullInfo.currentWarehouse && <div><Text type="secondary">Kho: {fullInfo.currentWarehouse.name}</Text></div>}
                </Col>
                <Col>
                  {fullInfo.quantitySummary && (
                    <Statistic
                      title="Tồn kho"
                      value={fullInfo.quantitySummary.currentStock}
                      suffix={fullInfo.quantitySummary.unit}
                      valueStyle={{ color: fullInfo.quantitySummary.currentStock > 0 ? '#52c41a' : '#ff4d4f' }}
                    />
                  )}
                </Col>
              </Row>
            </Card>

            <Tabs activeKey={activeTab} onChange={setActiveTab} items={drawerTabs} />
          </div>
        ) : (
          <Empty description="Không thể tải thông tin" />
        )}
      </Drawer>

      {/* Modal cấu hình thẻ */}
      <Modal
        title="Tùy chỉnh thông tin hiển thị trên thẻ"
        open={configVisible}
        onCancel={() => setConfigVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleConfigSubmit} initialValues={config}>
          <Divider orientation="left">Thông tin hiển thị</Divider>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="showCode" valuePropName="checked"><Checkbox>Mã mẫu</Checkbox></Form.Item></Col>
            <Col span={8}><Form.Item name="showVarietyName" valuePropName="checked"><Checkbox>Tên giống</Checkbox></Form.Item></Col>
            <Col span={8}><Form.Item name="showCategory" valuePropName="checked"><Checkbox>Loại cây</Checkbox></Form.Item></Col>
            <Col span={8}><Form.Item name="showCollectionDate" valuePropName="checked"><Checkbox>Ngày thu thập</Checkbox></Form.Item></Col>
            <Col span={8}><Form.Item name="showLocation" valuePropName="checked"><Checkbox>Địa điểm</Checkbox></Form.Item></Col>
            <Col span={8}><Form.Item name="showProvider" valuePropName="checked"><Checkbox>Nguồn gốc</Checkbox></Form.Item></Col>
            <Col span={8}><Form.Item name="showScientificName" valuePropName="checked"><Checkbox>Tên khoa học</Checkbox></Form.Item></Col>
            <Col span={8}><Form.Item name="showGerminationRate" valuePropName="checked"><Checkbox>Tỷ lệ nảy mầm</Checkbox></Form.Item></Col>
            <Col span={8}><Form.Item name="showExpiryDate" valuePropName="checked"><Checkbox>Ngày hết hạn</Checkbox></Form.Item></Col>
            <Col span={8}><Form.Item name="showStorageLocation" valuePropName="checked"><Checkbox>Vị trí lưu trữ</Checkbox></Form.Item></Col>
            <Col span={8}><Form.Item name="showQRCode" valuePropName="checked"><Checkbox>QR Code</Checkbox></Form.Item></Col>
          </Row>

          <Divider orientation="left">Cài đặt thẻ</Divider>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="cardTitle" label="Tiêu đề thẻ"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="qrCodeSize" label="Kích thước QR Code (px)"><InputNumber min={40} max={150} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="cardWidth" label="Chiều rộng thẻ (mm)"><InputNumber min={50} max={150} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="cardHeight" label="Chiều cao thẻ (mm)"><InputNumber min={30} max={100} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setConfigVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">Áp dụng</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Hidden component for printing */}
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          <PrintableCards cards={previewData} config={config} forPrint={true} />
        </div>
      </div>
    </div>
  );
}
