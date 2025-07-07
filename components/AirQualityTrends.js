// components/AirQualityTrends.js
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const AirQualityTrends = ({ data, timeRange }) => {
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(30, 136, 229, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#1e88e5',
    },
  };

  const getChartData = () => {
    switch (timeRange) {
      case '1h':
        return {
          labels: data.hour.map((_, i) => (i % 5 === 0 ? i : '')),
          datasets: [{
            data: data.hour.map(item => item.value)
          }]
        };
      case '24h':
        return {
          labels: data.day.map((_, i) => (i % 3 === 0 ? i : '')),
          datasets: [{
            data: data.day.map(item => item.value)
          }]
        };
      case '7d':
        return {
          labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          datasets: [{
            data: data.week.map(item => item.value)
          }]
        };
      default:
        return { labels: [], datasets: [] };
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AQI Trend ({timeRange})</Text>
      <LineChart
        data={getChartData()}
        width={Dimensions.get('window').width - 40}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  chart: {
    borderRadius: 16,
  },
});

export default AirQualityTrends;