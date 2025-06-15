import React, { useState, useEffect } from 'react'
import { Card, Row, Col, theme } from 'antd';
import { DollarCircleOutlined, LineChartOutlined } from '@ant-design/icons';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BASE_URL } from '../../constant';

const SalesReport = () => {
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const [profitLossData, setProfitLossData] = useState({
    todayProfit: 0,
    todayLoss: 0,
    monthlyProfit: 0,
    monthlyLoss: 0,
    overallProfit: 0,
    overallLoss: 0,
  });
  const [loadingProfitLoss, setLoadingProfitLoss] = useState(true);
  const [profitLossError, setProfitLossError] = useState(null);

  const [monthlyData, setMonthlyData] = useState([]);
  const [loadingMonthlyData, setLoadingMonthlyData] = useState(true);
  const [monthlyDataError, setMonthlyDataError] = useState(null);

  const [dailyProfitData, setDailyProfitData] = useState([]);
  const [loadingDailyProfit, setLoadingDailyProfit] = useState(true);
  const [dailyProfitError, setDailyProfitError] = useState(null);

  useEffect(() => {
    const fetchProfitLoss = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/sale/record`);
        setProfitLossData(response.data);
      } catch (error) {
        setProfitLossError('Error fetching profit/loss data');
        console.error('Error fetching profit/loss data:', error);
      } finally {
        setLoadingProfitLoss(false);
      }
    };
    fetchProfitLoss();
  }, []);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setLoadingMonthlyData(true);
        // Fetch data for all months of the current year
        const currentYear = new Date().getFullYear();
        const monthlyDataPromises = Array.from({ length: 12 }, (_, i) => 
          axios.get(`${BASE_URL}/api/sale/record-by-month?month=${i + 1}&year=${currentYear}`)
        );
        
        const responses = await Promise.all(monthlyDataPromises);
        const transformedData = responses.map((response, index) => ({
          month: new Date(0, index).toLocaleString('default', { month: 'short' }),
          profit: response.data.profit || 0,
          loss: response.data.loss || 0
        }));
        
        setMonthlyData(transformedData);
      } catch (error) {
        setMonthlyDataError('Error fetching monthly data');
        console.error('Error fetching monthly data:', error);
      } finally {
        setLoadingMonthlyData(false);
      }
    };
    fetchMonthlyData();
  }, []);

  useEffect(() => {
    const fetchDailyProfit = async () => {
      try {
        setLoadingDailyProfit(true);
        const response = await axios.get(`${BASE_URL}/api/sale/profit-by-hour`);
        console.log("res", response);
        
        // Create a map of all 24 hours with zero profit
        const allHours = Array.from({ length: 24 }, (_, i) => ({
          hour: `${i.toString().padStart(2, '0')}:00`,
          profit: 0
        }));

        // Update the hours that have data
        response.data.data.forEach(item => {
          const hourIndex = parseInt(item.hour.split(':')[0]);
          allHours[hourIndex] = {
            hour: item.hour,
            profit: item.profit
          };
        });

        setDailyProfitData(allHours);
      } catch (error) {
        setDailyProfitError('Error fetching daily profit data');
        console.error('Error fetching daily profit data:', error);
      } finally {
        setLoadingDailyProfit(false);
      }
    };
    fetchDailyProfit();
  }, []);

  return (
    <div
      style={{
        padding: 24,
        minHeight: 360,
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
      }}
    >
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '20px' }}>Profit and Loss</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            hoverable
            bordered={false}
            style={{ borderTop: '4px solid #4ade80', textAlign: 'center' }}
          >
            <DollarCircleOutlined style={{ fontSize: '40px', color: '#4ade80', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>Rs. {loadingProfitLoss ? 'Loading...' : profitLossData.todayProfit}</h3>
            <p style={{ color: '#666' }}>Today's Profit</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            hoverable
            bordered={false}
            style={{ borderTop: '4px solid #ef4444', textAlign: 'center' }}
          >
            <DollarCircleOutlined style={{ fontSize: '40px', color: '#ef4444', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>Rs. {loadingProfitLoss ? 'Loading...' : profitLossData.todayLoss}</h3>
            <p style={{ color: '#666' }}>Today's Loss</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            hoverable
            bordered={false}
            style={{ borderTop: '4px solid #4ade80', textAlign: 'center' }}
          >
            <LineChartOutlined style={{ fontSize: '40px', color: '#4ade80', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>Rs. {loadingProfitLoss ? 'Loading...' : profitLossData.monthlyProfit}</h3>
            <p style={{ color: '#666' }}>Monthly Profit</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            hoverable
            bordered={false}
            style={{ borderTop: '4px solid #ef4444', textAlign: 'center' }}
          >
            <LineChartOutlined style={{ fontSize: '40px', color: '#ef4444', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>Rs. {loadingProfitLoss ? 'Loading...' : profitLossData.monthlyLoss}</h3>
            <p style={{ color: '#666' }}>Monthly Loss</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            hoverable
            bordered={false}
            style={{ borderTop: '4px solid #4ade80', textAlign: 'center' }}
          >
            <DollarCircleOutlined style={{ fontSize: '40px', color: '#4ade80', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>Rs. {loadingProfitLoss ? 'Loading...' : profitLossData.overallProfit}</h3>
            <p style={{ color: '#666' }}>Overall Profit</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card
            hoverable
            bordered={false}
            style={{ borderTop: '4px solid #ef4444', textAlign: 'center' }}
          >
            <DollarCircleOutlined style={{ fontSize: '40px', color: '#ef4444', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>Rs. {loadingProfitLoss ? 'Loading...' : profitLossData.overallLoss}</h3>
            <p style={{ color: '#666' }}>Overall Loss</p>
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: '30px' }}>
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            style={{
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              padding: '20px',
            }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333', marginBottom: '20px' }}>Monthly Profit & Loss</h3>
            {loadingMonthlyData ? (
              <div>Loading Monthly Data Chart...</div>
            ) : monthlyDataError ? (
              <div style={{ color: 'red' }}>{monthlyDataError}</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={monthlyData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="profit" name="Profit" fill="#4ade80" />
                  <Bar dataKey="loss" name="Loss" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            style={{
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              padding: '20px',
            }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333', marginBottom: '20px' }}>Daily Profit (by Hour)</h3>
            {loadingDailyProfit ? (
              <div>Loading Daily Profit Chart...</div>
            ) : dailyProfitError ? (
              <div style={{ color: 'red' }}>{dailyProfitError}</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={dailyProfitData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                  barSize={20}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    scale="point"
                    padding={{ left: 10, right: 10 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="profit" name="Profit" fill="#4ade80" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default SalesReport