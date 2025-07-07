// services/AirQualityService.js
import { useState, useEffect } from 'react';

const useAirQualityData = () => {
  const [airQuality, setAirQuality] = useState({
    pm25: 0,
    co2: 0,
    nh3: 0,
    benzene: 0,
    smoke: 0,
    vocs: 0,
    aqi: 0,
    status: 'Loading...',
    trends: {
      hour: [],
      day: [],
      week: []
    }
  });

  // Simulate real-time data updates
  useEffect(() => {
    const fetchData = () => {
      // In a real app, this would be an API call
      const newData = {
        pm25: Math.floor(Math.random() * 300),
        co2: Math.floor(Math.random() * 2000),
        nh3: Math.floor(Math.random() * 50),
        benzene: Math.random().toFixed(2),
        smoke: Math.floor(Math.random() * 100),
        vocs: Math.floor(Math.random() * 500),
        aqi: Math.floor(Math.random() * 300),
        status: calculateStatus(Math.floor(Math.random() * 300)),
        trends: {
          hour: Array(60).fill(0).map((_, i) => ({
            time: i,
            value: Math.floor(Math.random() * 300)
          })),
          day: Array(24).fill(0).map((_, i) => ({
            time: i,
            value: Math.floor(Math.random() * 300)
          })),
          week: Array(7).fill(0).map((_, i) => ({
            day: i,
            value: Math.floor(Math.random() * 300)
          }))
        }
      };
      setAirQuality(newData);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const calculateStatus = (aqi) => {
    if (aqi <= 50) return 'Excellent';
    if (aqi <= 100) return 'Good';
    if (aqi <= 150) return 'Moderate';
    if (aqi <= 200) return 'Poor';
    if (aqi <= 300) return 'Very Poor';
    return 'Hazardous';
  };

  const getAqiColor = (aqi) => {
    if (aqi <= 50) return '#4CAF50';
    if (aqi <= 100) return '#8BC34A';
    if (aqi <= 150) return '#FFC107';
    if (aqi <= 200) return '#FF9800';
    if (aqi <= 300) return '#F44336';
    return '#9C27B0';
  };

  return { airQuality, getAqiColor };
};

export default useAirQualityData;