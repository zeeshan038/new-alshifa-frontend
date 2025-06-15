import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, theme, Card, Row, Col, Select, Table, Space, Tag } from 'antd';
import { 
  DashboardOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  MessageOutlined,
  MedicineBoxOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
  WarningOutlined,
  DollarCircleOutlined, 
  LineChartOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import { BASE_URL } from '../../constant';

const { Header, Sider, Content } = Layout;
const { SubMenu } = Menu;

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const [stockSummary, setStockSummary] = useState({
    totalStockIn: 0,
    totalStockOut: 0,
    totalAvailableStock: 0,
    totalStocks: 0,
    totalShortExpiry: 0,
    totalExpired: 0,
  });
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchStockSummary = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/stock/summary`);
        setStockSummary(response.data);
      } catch (error) {
        setSummaryError('Error fetching stock summary');
        console.error('Error fetching stock summary:', error);
      } finally {
        setLoadingSummary(false);
      }
    };

    const fetchRecentSales = async () => {
      setLoadingSales(true);
      try {
        const response = await axios.get(`${BASE_URL}/api/sale/sales`);
        if (response.data.status) {
          const formattedSales = response.data.sales
            .map((sale, index) => ({
              key: sale._id,
              saleId: `S${index + 1}`,
              medicine: sale.medicineId.name,
              brand: sale.brand,
              batchNumber: sale.batchId.batchNumber,
              quantity: sale.quantitySold,
              purchasePrice: sale.purchasePrice,
              sellingPrice: sale.sellingPrice,
              profit: sale.profit,
              category: sale.category,
              date: new Date(sale.createdAt).toLocaleDateString(),
              status: 'Sold'
            }))
            .slice(0, 10); 
          setRecentSales(formattedSales);
        }
      } catch (error) {
        console.error('Error fetching recent sales:', error);
      } finally {
        setLoadingSales(false);
      }
    };

    fetchStockSummary();
    fetchRecentSales();
  }, []);


  const renderMenuItems = (items) => {
    return items.map(item => {
      if (item.children) {
        return (
          <SubMenu key={item.key} icon={item.icon} title={item.label}>
            {renderMenuItems(item.children)}
          </SubMenu>
        );
      } else {
        return (
          <Menu.Item key={item.key} icon={item.icon} className={item.key === '1' ? 'ant-menu-item-selected-custom' : ''}><a href={item.path}>{item.label} {item.badge && <span className="ant-menu-item-badge">{item.badge}</span>}</a></Menu.Item>
        );
      }
    });
  };

  const recentSalesColumns = [
    { 
      title: 'Name', 
      dataIndex: 'medicine', 
      key: 'medicine',
      render: (text) => text || 'N/A'
    },
    { 
      title: 'Brand', 
      dataIndex: 'brand', 
      key: 'brand',
      render: (text) => text || 'N/A'
    },
    { 
      title: 'Batch', 
      dataIndex: 'batchNumber', 
      key: 'batchNumber',
      render: (text) => text || 'N/A'
    },
    { 
      title: 'Category', 
      dataIndex: 'category', 
      key: 'category',
      render: (text) => text || 'N/A'
    },
    { 
      title: 'Quantity', 
      dataIndex: 'quantity', 
      key: 'quantity',
      render: (text) => text || '0'
    },
    { 
      title: 'Purchase Price (Rs.)', 
      dataIndex: 'purchasePrice', 
      key: 'purchasePrice',
      render: (price) => price ? `Rs. ${price}` : 'Rs. 0'
    },
    { 
      title: 'Selling Price (Rs.)', 
      dataIndex: 'sellingPrice', 
      key: 'sellingPrice',
      render: (price) => price ? `Rs. ${price}` : 'Rs. 0'
    },
    { 
      title: 'Profit (Rs.)', 
      dataIndex: 'profit', 
      key: 'profit',
      render: (profit) => profit ? `Rs. ${profit}` : 'Rs. 0'
    },
    { 
      title: 'Date', 
      dataIndex: 'date', 
      key: 'date',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag color="green">
          {status ? status.toUpperCase() : 'N/A'}
        </Tag>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {/* Dashboard Cards Section */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={12} md={12} lg={6}>
                <Card 
                  hoverable
                  bordered={false}
                  style={{ borderTop: '4px solid #4ade80', textAlign: 'center' }}
                >
                  <AppstoreOutlined style={{ fontSize: '40px', color: '#4ade80', marginBottom: '12px' }} />
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>{loadingSummary ? 'Loading...' : stockSummary.totalStocks}</h3>
                  
                 
                  <Button type="link" style={{ color: '#2c988c' }}>Total Stocks »</Button>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={12} lg={6}>
                <Card 
                  hoverable
                  bordered={false}
                  style={{ borderTop: '4px solid #facc15', textAlign: 'center' }}
                >
                  <FileTextOutlined style={{ fontSize: '40px', color: '#facc15', marginBottom: '12px' }} />
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>Rs. 8,55,875</h3>
                  <Button type="link" className='text-3xl' style={{  color: '#b49200' }}>Profit</Button>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={12} lg={6}>
                <Card 
                  hoverable
                  bordered={false}
                  style={{ borderTop: '4px solid #60a5fa', textAlign: 'center' }}
                >
                  <MedicineBoxOutlined style={{ fontSize: '40px', color: '#60a5fa', marginBottom: '12px' }} />
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>{loadingSummary ? 'Loading...' : stockSummary.totalAvailableStock}</h3>

                  <Button type="link" className='text-3xl' style={{  color:'#333'}}>Available Stocks</Button>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={12} lg={6}>
                <Card 
                  hoverable
                  bordered={false}
                  style={{ borderTop: '4px solid #ef4444', textAlign: 'center' }}
                >
                  <BellOutlined style={{ fontSize: '40px', color: '#ef4444', marginBottom: '12px' }} />
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>{loadingSummary ? 'Loading...' : stockSummary.totalExpired}</h3>
                  <Button type="link" style={{ color: '#ef4444' }}>Expired Stocks</Button>
                </Card>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={12} md={12} lg={6}>
                <Card 
                  hoverable
                  bordered={false}
                  style={{ borderTop: '4px solid #4ade80', textAlign: 'center' }}
                >
                  <PlusCircleOutlined style={{ fontSize: '40px', color: '#4ade80', marginBottom: '12px' }} />
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>{loadingSummary ? 'Loading...' : stockSummary.totalStockIn}</h3>
                  
                 
                  <Button type="link" style={{ color: '#2c988c' }}>Stock In »</Button>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={12} lg={6}>
                <Card 
                  hoverable
                  bordered={false}
                  style={{ borderTop: '4px solid #facc15', textAlign: 'center' }}
                >
                  <MinusCircleOutlined style={{ fontSize: '40px', color: '#facc15', marginBottom: '12px' }} />
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>{loadingSummary ? 'Loading...' : stockSummary.totalStockOut}</h3>
                  <Button type="link" className='text-3xl' style={{  color: '#b49200' }}>Stock Out</Button>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={12} lg={6}>
                <Card 
                  hoverable
                  bordered={false}
                  style={{ borderTop: '4px solid #60a5fa', textAlign: 'center' }}
                >
                  <MedicineBoxOutlined style={{ fontSize: '40px', color: '#60a5fa', marginBottom: '12px' }} />
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>{loadingSummary ? 'Loading...' : stockSummary.totalAvailableStock}</h3>

                  <Button type="link" className='text-3xl' style={{  color:'#333'}}>Available Stocks</Button>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={12} lg={6}>
                <Card 
                  hoverable
                  bordered={false}
                  style={{ borderTop: '4px solid #ef4444', textAlign: 'center' }}
                >
                  <BellOutlined style={{ fontSize: '40px', color: '#ef4444', marginBottom: '12px' }} />
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>{loadingSummary ? 'Loading...' : stockSummary.totalShortExpiry}</h3>
                  <Button type="link" style={{ color: '#ef4444' }}>Short Expirey</Button>
                </Card>
              </Col>
            </Row>

            {/* Recent Sales Table */}
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '20px', marginTop: '40px' }}>Recent Sales</h2>
            <Row>
              <Col span={24}>
                <Card bordered={false}>
                  <Table
                    columns={recentSalesColumns}
                    dataSource={recentSales}
                    loading={loadingSales}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 'max-content' }}
                  />
                </Card>
              </Col>
            </Row>
           
          </div>
        </Content>
    </Layout>
  );
};

export default Dashboard;