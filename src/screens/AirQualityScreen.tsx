import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Card } from 'react-native-paper';

const pollutantData = [
  { name: 'PM2.5', value: 85 },
  { name: 'CO2', value: 430 },
  { name: 'NH3', value: 12 },
  { name: 'Benzene', value: 3 },
  { name: 'Smoke', value: 28 },
  { name: 'VOCs', value: 100 },
];
const getAQIColor = (value: number) => {
  if (value <= 50) return '#00C853';       // Fresh Green (Good)
  if (value <= 100) return '#FFD600';      // Amber (Moderate)
  if (value <= 150) return '#FF6D00';      // Vivid Orange (Unhealthy for Sensitive Groups)
  if (value <= 200) return '#D50000';      // Bright Red (Unhealthy)
  if (value <= 300) return '#6A1B9A';      // Deep Purple (Very Unhealthy)
  return '#3E2723';                        // Dark Brown (Hazardous)
};
const screenWidth = Dimensions.get('window').width;

const generateChartData = () => ({
  labels: ['0h', '4h', '8h', '12h', '16h', '20h'],
  datasets: [
    {
      data: [40, 50, 80, 65, 90, 70],
      color: () => '#03A9F4',
      strokeWidth: 2,
    },
  ],
});

const AirQualityScreen = () => {
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d'>('24h');

  useEffect(() => {
    // Fetch live data from API here (pollutantData simulation for now)
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Real-Time Air Quality Monitoring</Text>

      <View style={styles.cardContainer}>
        {pollutantData.map((pollutant) => (
          <Card key={pollutant.name} style={[styles.card, { backgroundColor: getAQIColor(pollutant.value) }]}>
            <Card.Content>
              <Text style={styles.pollutantName}>{pollutant.name}</Text>
              <Text style={styles.pollutantValue}>{pollutant.value}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      <Text style={styles.graphTitle}>Air Quality Trend ({timeframe})</Text>
      <View style={styles.timeframeButtons}>
        {['1h', '24h', '7d'].map((frame) => (
          <Text
            key={frame}
            style={[styles.timeframe, timeframe === frame && styles.activeTimeframe]}
            onPress={() => setTimeframe(frame as '1h' | '24h' | '7d')}>
            {frame}
          </Text>
        ))}
      </View>

      <LineChart
        data={generateChartData()}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#f5f5f5',
          backgroundGradientTo: '#e0e0e0',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          labelColor: () => '#333',
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#2196F3',
          },
        }}
        style={styles.chart}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FAFAFA',
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop:18,
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    marginBottom: 12,
    borderRadius: 12,
  },
  pollutantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  pollutantValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    color: '#444',
    textAlign: 'center',
  },
  timeframeButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  timeframe: {
    marginHorizontal: 12,
    fontSize: 16,
    padding: 6,
    color: '#888',
  },
  activeTimeframe: {
    color: '#2196F3',
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderColor: '#2196F3',
  },
  chart: {
    borderRadius: 16,
    marginBottom: 32,
  },
});

export default AirQualityScreen;
