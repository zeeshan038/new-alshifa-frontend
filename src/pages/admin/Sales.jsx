import React, { useState, useEffect } from 'react';
import { Table, Input, Card, theme, Select, Tag, Button, Row, Col } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { BASE_URL } from '../../constant';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const { Search } = Input;
const { Option } = Select;

const Sales = () => {
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchSales();
    // Fetch unique categories
    const uniqueCategories = [...new Set(salesData.map(sale => sale.category))];
    setCategories(uniqueCategories);
  }, [pagination.current, pagination.pageSize, searchText, selectedCategory, selectedType]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/sale/sales`, {
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
          name: searchText,
          category: selectedCategory,
          type: selectedType
        }
      });
      if (response.data.status) {
        setSalesData(response.data.sales);
        // Update total count if available in response
        if (response.data.total) {
          setPagination(prev => ({
            ...prev,
            total: response.data.total
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page on search
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setPagination(prev => ({ ...prev, current: 1 })); 
  };

  const handleTypeChange = (value) => {
    setSelectedType(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Add title based on selected type
    let title = 'NEW-ALSHIFA PHARMACY';
    if (selectedType === 'daily') {
      title = 'Daily Sales Report';
    } else if (selectedType === 'monthly') {
      title = 'Monthly Sales Report';
    } else if (selectedType === 'total') {
      title = 'Total Sales Report';
    }

    // Add title to PDF
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    // Prepare table data
    const tableData = salesData.map((sale, index) => [
      index + 1,
      sale.medicineId?.name || '',
      sale.brand || '',
      sale.batchId?.batchNumber || '',
      sale.quantitySold || '',
      `${sale.purchasePrice || 0}`,
      `${sale.sellingPrice || 0}`,
      `${sale.profit || 0}`,
      new Date(sale.createdAt).toLocaleDateString(),
      new Date(sale.createdAt).toLocaleTimeString(),
      'SOLD'
    ]);

    // Add table to PDF
    autoTable(doc, {
      head: [['S.No', 'Medicine Name', 'Brand', 'Batch Number', 'Quantity', 'Purchase Price', 'Selling Price', 'Profit', 'Date', 'Time', 'Status']],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    // Save the PDF
    doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const columns = [
    {
      title: 'S.No',
      dataIndex: 'serialNo',
      key: 'serialNo',
      width: 80,
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Medicine Name',
      dataIndex: ['medicineId', 'name'],
      key: 'medicineName',
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
    },
    {
      title: 'Batch Number',
      dataIndex: ['batchId', 'batchNumber'],
      key: 'batchNumber',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantitySold',
      key: 'quantity',
    },
    {
      title: 'Purchase Price',
      dataIndex: 'purchasePrice',
      key: 'purchasePrice',
      render: (price) => `Rs. ${price}`,
    },
    {
      title: 'Selling Price',
      dataIndex: 'sellingPrice',
      key: 'sellingPrice',
      render: (price) => `Rs. ${price}`,
    },
    {
      title: 'Profit',
      dataIndex: 'profit',
      key: 'profit',
      render: (profit) => `Rs. ${profit}`,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Time',
      dataIndex: 'createdAt',
      key: 'time',
      render: (date) => new Date(date).toLocaleTimeString(),
    },
    {
      title: 'Status',
      key: 'status',
      render: () => (
        <Tag color="green">
          SOLD
        </Tag>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: 24,
        minHeight: 360,
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
      }}
    >
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', margin: 0 }}>Sales Records</h2>
        </Col>
        <Col xs={24} md={16}>
          <Row gutter={[16, 16]} justify="end">
            <Col xs={24} sm={12} lg={8}>
              <Select
                placeholder="Select Category"
                style={{ width: '100%' }}
                onChange={handleCategoryChange}
                allowClear
              >
                {categories.map(category => (
                  <Option key={category} value={category}>{category}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Select
                placeholder="Filter by Type"
                style={{ width: '100%' }}
                onChange={handleTypeChange}
                allowClear
              >
                <Option value="daily">Daily</Option>
                <Option value="monthly">Monthly</Option>
                <Option value="total">Total</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Search
                placeholder="Search by medicine name"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                style={{ width: '100%' }}
                onSearch={handleSearch}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownloadPDF}
                disabled={loading || salesData.length === 0}
                style={{ width: '100%' }}
              >
                Download PDF
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
      <Card bordered={false}>
        <Table
          columns={columns}
          dataSource={salesData}
          loading={loading}
          rowKey="_id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: 'max-content' }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default Sales;