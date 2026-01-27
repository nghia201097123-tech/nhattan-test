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
  message,
  Checkbox,
  Row,
  Col,
  Form,
  Switch,
  InputNumber,
  Divider,
} from 'antd';
import {
  SearchOutlined,
  PrinterOutlined,
  DownloadOutlined,
  EyeOutlined,
  QrcodeOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';
import { seedCardService } from '@/services/samples.service';
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
  qrCodeSize: 80,
  cardTitle: 'THẺ GIỐNG',
  cardWidth: 85,
  cardHeight: 54,
};

// Component thẻ giống để in
const SeedCard = ({ data, config }: { data: SeedCardData; config: SeedCardConfig }) => {
  return (
    <div
      style={{
        width: `${config.cardWidth}mm`,
        height: `${config.cardHeight}mm`,
        border: '1px solid #000',
        padding: '4mm',
        fontFamily: 'Arial, sans-serif',
        fontSize: '9pt',
        display: 'flex',
        flexDirection: 'column',
        pageBreakInside: 'avoid',
        backgroundColor: '#fff',
        boxSizing: 'border-box',
      }}
    >
      {/* Tiêu đề */}
      <div style={{
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '11pt',
        marginBottom: '3mm',
        borderBottom: '1px solid #ccc',
        paddingBottom: '2mm'
      }}>
        {config.cardTitle}
      </div>

      {/* Nội dung: Thông tin bên trái, QR bên phải */}
      <div style={{ display: 'flex', flex: 1, gap: '3mm' }}>
        {/* Thông tin bên trái */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          lineHeight: '1.5',
          paddingRight: '2mm',
        }}>
          {config.showCode && (
            <div style={{ marginBottom: '1mm' }}><strong>Mã:</strong> {data.code}</div>
          )}
          {config.showVarietyName && (
            <div style={{ marginBottom: '1mm' }}><strong>Giống:</strong> {data.varietyName}</div>
          )}
          {config.showCategory && (
            <div style={{ marginBottom: '1mm' }}><strong>Loại:</strong> {data.categoryName}</div>
          )}
          {config.showScientificName && data.scientificName && (
            <div style={{ marginBottom: '1mm' }}><strong>Tên KH:</strong> <em>{data.scientificName}</em></div>
          )}
          {config.showCollectionDate && (
            <div style={{ marginBottom: '1mm' }}><strong>Thu thập:</strong> {dayjs(data.collectionDate).format('DD/MM/YYYY')}</div>
          )}
          {config.showLocation && data.location && (
            <div style={{ marginBottom: '1mm' }}><strong>Địa điểm:</strong> {data.location}</div>
          )}
          {config.showProvider && data.providerName && (
            <div style={{ marginBottom: '1mm' }}><strong>Nguồn:</strong> {data.providerName}</div>
          )}
          {config.showGerminationRate && data.germinationRate !== undefined && (
            <div style={{ marginBottom: '1mm' }}><strong>Nảy mầm:</strong> {data.germinationRate}%</div>
          )}
          {config.showExpiryDate && data.expiryDate && (
            <div style={{ marginBottom: '1mm' }}><strong>Hết hạn:</strong> {dayjs(data.expiryDate).format('DD/MM/YYYY')}</div>
          )}
          {config.showStorageLocation && data.storageLocation && (
            <div style={{ marginBottom: '1mm' }}><strong>Vị trí:</strong> {data.storageLocation}</div>
          )}
        </div>

        {/* QR Code bên phải */}
        {config.showQRCode && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderLeft: '1px dashed #ccc',
            paddingLeft: '3mm',
          }}>
            <QRCodeSVG value={data.qrCodeData} size={config.qrCodeSize} />
          </div>
        )}
      </div>
    </div>
  );
};

// Component để in nhiều thẻ
const PrintableCards = ({ cards, config }: { cards: SeedCardData[]; config: SeedCardConfig }) => {
  return (
    <div style={{ padding: '10mm' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5mm' }}>
        {cards.map((card) => (
          <SeedCard key={card.id} data={card} config={config} />
        ))}
      </div>
    </div>
  );
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
  const [previewVisible, setPreviewVisible] = useState(false);
  const [configVisible, setConfigVisible] = useState(false);
  const [previewData, setPreviewData] = useState<SeedCardData[]>([]);
  const [form] = Form.useForm();

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'Thẻ giống',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await seedCardService.getSamplesForPrint({
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

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const cfg = await seedCardService.getDefaultConfig();
        setConfig({ ...defaultConfig, ...cfg });
        form.setFieldsValue({ ...defaultConfig, ...cfg });
      } catch (error) {
        form.setFieldsValue(defaultConfig);
      }
    };
    loadConfig();
  }, []);

  const handlePreview = (record: SeedCardData) => {
    setPreviewData([record]);
    setPreviewVisible(true);
  };

  const handlePreviewSelected = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một mẫu');
      return;
    }
    const selected = data.filter((d) => selectedRowKeys.includes(d.id));
    setPreviewData(selected);
    setPreviewVisible(true);
  };

  const handlePrintSelected = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một mẫu');
      return;
    }
    const selected = data.filter((d) => selectedRowKeys.includes(d.id));
    setPreviewData(selected);
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  const handleExportQRCode = async (record: SeedCardData) => {
    try {
      // Tạo canvas từ QR code SVG
      const svgElement = document.createElement('div');
      svgElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        ${document.querySelector(`#qr-${record.id}`)?.innerHTML || ''}
      </svg>`;

      // Sử dụng canvas để xuất PNG
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        const img = new Image();
        const svgBlob = new Blob([`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
          <rect width="100%" height="100%" fill="white"/>
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">
              ${document.querySelector(`#qr-${record.id}`)?.outerHTML || ''}
            </div>
          </foreignObject>
        </svg>`], { type: 'image/svg+xml' });

        const url = URL.createObjectURL(svgBlob);
        img.onload = () => {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, 200, 200);
          ctx.drawImage(img, 0, 0);

          canvas.toBlob((blob) => {
            if (blob) {
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `QR_${record.code}.png`;
              link.click();
            }
          }, 'image/png');

          URL.revokeObjectURL(url);
        };
        img.src = url;
      }

      message.success('Đang xuất QR Code...');
    } catch (error) {
      message.error('Không thể xuất QR Code');
    }
  };

  const handleConfigSubmit = (values: SeedCardConfig) => {
    setConfig(values);
    setConfigVisible(false);
    message.success('Đã cập nhật cấu hình thẻ');
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
    },
    {
      title: 'Loại cây',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
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
      render: (val: number) => val !== undefined ? `${val}%` : '-',
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
      width: 150,
      render: (_: any, record: SeedCardData) => (
        <Space size="small">
          <Tooltip title="Xem thẻ">
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => handlePreview(record)} />
          </Tooltip>
          <Tooltip title="In thẻ">
            <Button
              type="text"
              size="small"
              icon={<PrinterOutlined />}
              onClick={() => {
                setPreviewData([record]);
                setTimeout(() => handlePrint(), 100);
              }}
            />
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Thẻ giống & QR Code</Title>
        <Space>
          <Button icon={<SettingOutlined />} onClick={() => setConfigVisible(true)}>
            Tùy chỉnh thẻ
          </Button>
          <Button icon={<EyeOutlined />} onClick={handlePreviewSelected} disabled={selectedRowKeys.length === 0}>
            Xem trước ({selectedRowKeys.length})
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
            onChange: (p, l) => {
              setPage(p);
              setLimit(l);
            },
          }}
        />
      </Card>

      {/* Modal xem trước thẻ */}
      <Modal
        title="Xem trước thẻ giống"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => handlePrint()}
          >
            In thẻ
          </Button>,
        ]}
      >
        <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
          <PrintableCards cards={previewData} config={config} />
        </div>
      </Modal>

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
            <Col span={8}>
              <Form.Item name="showCode" valuePropName="checked">
                <Checkbox>Mã mẫu</Checkbox>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="showVarietyName" valuePropName="checked">
                <Checkbox>Tên giống</Checkbox>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="showCategory" valuePropName="checked">
                <Checkbox>Loại cây</Checkbox>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="showCollectionDate" valuePropName="checked">
                <Checkbox>Ngày thu thập</Checkbox>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="showLocation" valuePropName="checked">
                <Checkbox>Địa điểm</Checkbox>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="showProvider" valuePropName="checked">
                <Checkbox>Nguồn gốc</Checkbox>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="showScientificName" valuePropName="checked">
                <Checkbox>Tên khoa học</Checkbox>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="showGerminationRate" valuePropName="checked">
                <Checkbox>Tỷ lệ nảy mầm</Checkbox>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="showExpiryDate" valuePropName="checked">
                <Checkbox>Ngày hết hạn</Checkbox>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="showStorageLocation" valuePropName="checked">
                <Checkbox>Vị trí lưu trữ</Checkbox>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="showQRCode" valuePropName="checked">
                <Checkbox>QR Code</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Cài đặt thẻ</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="cardTitle" label="Tiêu đề thẻ">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="qrCodeSize" label="Kích thước QR Code (px)">
                <InputNumber min={40} max={150} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="cardWidth" label="Chiều rộng thẻ (mm)">
                <InputNumber min={50} max={150} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="cardHeight" label="Chiều cao thẻ (mm)">
                <InputNumber min={30} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
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
          <PrintableCards cards={previewData} config={config} />
        </div>
      </div>
    </div>
  );
}
