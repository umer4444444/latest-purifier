// screens/DHT22Screen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, ProgressBar } from 'react-native-paper';

const DHT22Screen = () => {
  const [temperature, setTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);

  // Simulate real-time updates (replace with actual DHT22 data source)
  useEffect(() => {
    const interval = setInterval(() => {
      const temp = 20 + Math.random() * 10; // Simulated temp
      const hum = 40 + Math.random() * 30; // Simulated humidity
      setTemperature(parseFloat(temp.toFixed(1)));
      setHumidity(parseFloat(hum.toFixed(1)));
    }, 3000);
    

    return () => clearInterval(interval);
  }, []);

  const getTempAdvice = () => {
    if (temperature > 28) return '🔴 Too hot! Start AC.';
    if (temperature < 18) return '🟡 Too cold! Close windows.';
    return '🟢 Ideal temperature.';
  };

  const getHumidityAdvice = () => {
    if (humidity > 65) return '🔴 High humidity! Turn on ventilation.';
    if (humidity < 35) return '🟡 Air too dry!';
    return '🟢 Humidity is ideal.';
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>DHT22 Sensor Readings</Text>

      <Card style={styles.card}>
        <Card.Title title="Temperature" />
        <Card.Content>
          <Text style={styles.value}>{temperature} °C</Text>
          <ProgressBar progress={temperature / 40} color="#f44336" style={styles.bar} />
          <Text style={styles.advice}>{getTempAdvice()}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Humidity" />
        <Card.Content>
          <Text style={styles.value}>{humidity} %</Text>
          <ProgressBar progress={humidity / 100} color="#2196f3" style={styles.bar} />
          <Text style={styles.advice}>{getHumidityAdvice()}</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center',marginTop:25, },
  card: { marginBottom: 16 },
  value: { fontSize: 28, fontWeight: 'bold', marginVertical: 8 },
  bar: { height: 8, borderRadius: 4, marginVertical: 8 },
  advice: { fontSize: 16, marginTop: 4 },
});

export default DHT22Screen;
