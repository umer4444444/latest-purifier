import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Snackbar } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Dashboard: {
    email?: string;
  };
  // Add other screen params here if needed
};

type DashboardScreenRouteProp = RouteProp<RootStackParamList, 'Dashboard'>;

const { width } = Dimensions.get('window');

// Mock data for trends
const dailyData = {
  labels: ["12AM", "3AM", "6AM", "9AM", "12PM", "3PM", "6PM", "9PM"],
  datasets: [
    {
      data: [65, 78, 52, 89, 76, 68, 97, 110],
      color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
      strokeWidth: 2
    }
  ]
};

const weeklyData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      data: [85, 92, 78, 95, 87, 102, 89],
      color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
      strokeWidth: 2
    }
  ]
};

const monthlyData = {
  labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
  datasets: [
    {
      data: [88, 92, 85, 95],
      color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
      strokeWidth: 2
    }
  ]
};

// Mock event logs
const eventLogs = [
  { time: "2023-06-15 08:30", event: "AQI exceeded 150", level: "high" },
  { time: "2023-06-14 19:45", event: "Filter replacement reminder", level: "medium" },
  { time: "2023-06-13 12:15", event: "Auto mode activated", level: "low" },
  { time: "2023-06-12 06:30", event: "Device turned on", level: "low" },
  { time: "2023-06-10 22:10", event: "Fan speed increased to 100%", level: "medium" },
];

export default function DashboardScreen() {
  const [isOn, setIsOn] = React.useState(true);
  const [autoMode, setAutoMode] = React.useState(true);
  const [fanSpeed, setFanSpeed] = React.useState(0.6);
  const [notification, setNotification] = React.useState('');
  const [showNotification, setShowNotification] = React.useState(false);
  const [filterHealth, setFilterHealth] = React.useState(0.8);
  const [activeTab, setActiveTab] = React.useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [showLogs, setShowLogs] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState('');
  const [airQuality, setAirQuality] = React.useState({ aqi: 42, status: 'Excellent' });

  const navigation = useNavigation();
  const route = useRoute<DashboardScreenRouteProp>();

  const addLogEntry = async (event: string, level: string) => {
  try {
    const email = route.params?.email || '';
    if (!email) return;
    
    const timestamp = new Date().toISOString();
    const logEntry = { time: timestamp, event, level };
    
    // Store in user-specific logs
    const userKey = `user:${email}`;
    const userData = await AsyncStorage.getItem(userKey);
    let logs = [];
    
    if (userData) {
      const parsedData = JSON.parse(userData);
      logs = parsedData.logs || [];
    }
    
    const updatedLogs = [logEntry, ...logs].slice(0, 100);
    await AsyncStorage.mergeItem(userKey, JSON.stringify({ logs: updatedLogs }));
    
    // Also store in global logs for admin
    const adminLogsKey = `admin:logs`;
    const adminLogsData = await AsyncStorage.getItem(adminLogsKey);
    let allLogs = [];
    
    if (adminLogsData) {
      allLogs = JSON.parse(adminLogsData);
    }
    
    const updatedAdminLogs = [{
      email,
      ...logEntry
    }, ...allLogs].slice(0, 500); // Keep last 500 entries
    
    await AsyncStorage.setItem(adminLogsKey, JSON.stringify(updatedAdminLogs));
    
  } catch (error) {
    console.error('Error saving log:', error);
  }
};

  const getAqiStatus = (aqi: number): string => {
    if (aqi < 50) return 'Excellent';
    if (aqi < 100) return 'Moderate';
    if (aqi < 150) return 'Unhealthy';
    return 'Hazardous';
  };

  React.useEffect(() => {
    const email = route.params?.email || '';
    setUserEmail(email);
  }, [route.params]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const newAqi = Math.floor(Math.random() * 200);
      const status = getAqiStatus(newAqi);
      setAirQuality({ aqi: newAqi, status });

      if (newAqi >= 150) {
        setNotification('⚠️ Air quality is hazardous. Please turn on the purifier!');
        setShowNotification(true);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setFilterHealth(prev => Math.max(0, parseFloat((prev - 0.01).toFixed(2))));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Animation Refs
  const spinValue = React.useRef(new Animated.Value(0)).current;
  const glowAnim = React.useRef(new Animated.Value(0)).current;
  const floatAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.8],
  });

  const getAqiColor = (aqi: number): string => {
    if (aqi < 50) return '#4CAF50';
    if (aqi < 100) return '#FFC107';
    if (aqi < 150) return '#FF9800';
    return '#F44336';
  };

  const aqiColor = getAqiColor(airQuality.aqi);

  const exportLogs = async () => {
    try {
      const csvContent = eventLogs.map(log => 
        `${log.time},${log.event},${log.level}`
      ).join('\n');
      
      const fileUri = FileSystem.documentDirectory + 'air_quality_logs.csv';
      await FileSystem.writeAsStringAsync(fileUri, 'Time,Event,Level\n' + csvContent);
      
      if (!(await Sharing.isAvailableAsync())) {
        alert('Sharing not available on this platform');
        return;
      }
      
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Air Quality Logs',
        UTI: 'public.comma-separated-values-text'
      });
    } catch (error) {
      console.error('Error exporting logs:', error);
      setNotification('Failed to export logs');
      setShowNotification(true);
    }
  };

  const getEventColor = (level: string) => {
    switch (level) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      default: return '#4CAF50';
    }
  };

  const getActiveData = () => {
    switch (activeTab) {
      case 'daily': return dailyData;
      case 'weekly': return weeklyData;
      case 'monthly': return monthlyData;
      default: return dailyData;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.roomText}>Living Room Air</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => navigation.reset({
  index: 0,
  routes: [{ name: "Auth" as never }]
})}
            >
              <MaterialCommunityIcons name="logout" size={22} color="#F44336" />
            </TouchableOpacity>
            <View style={styles.statusIndicator}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isOn ? '#4CAF50' : '#F44336' },
                ]}
              />
              <Text style={styles.statusText}>{isOn ? 'Active' : 'Inactive'}</Text>
            </View>
          </View>
        </View>

        {/* AQI Visualization */}
        <View style={styles.aqiContainer}>
          <Animated.View
            style={[
              styles.aqiRing,
              { borderColor: aqiColor, transform: [{ rotate: spin }] },
            ]}
          />
          <Animated.View
            style={[
              styles.glowOverlay,
              { borderColor: aqiColor, opacity: glowOpacity },
            ]}
          />
          <Animated.View
            style={[
              styles.aqiCard,
              {
                shadowColor: aqiColor,
                transform: [{ translateY: floatAnim }],
              },
            ]}
          >
            <Text style={styles.aqiLabel}>AIR QUALITY</Text>
            <Text style={[styles.aqiValue, { color: aqiColor }]}>
              {airQuality.aqi}
            </Text>
            <View style={styles.aqiStatusContainer}>
              <MaterialCommunityIcons name="leaf" size={20} color={aqiColor} />
              <Text style={[styles.aqiStatus, { color: aqiColor }]}>
                {airQuality.status}
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <View style={styles.controlRow}>
            <TouchableOpacity
              style={[styles.controlButton, autoMode && styles.controlButtonActive]}
              onPress={() => setAutoMode(!autoMode)}
            >
              <MaterialCommunityIcons
                name="robot"
                size={24}
                color={autoMode ? '#fff' : '#2196F3'}
              />
              <Text
                style={[
                  styles.controlButtonText,
                  autoMode && styles.controlButtonTextActive,
                ]}
              >
                Auto
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.powerButton, isOn && styles.powerButtonActive]}
              onPress={() => setIsOn(!isOn)}
            >
              <MaterialCommunityIcons
                name="power"
                size={32}
                color={isOn ? '#fff' : '#F44336'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, !autoMode && styles.controlButtonActive]}
              onPress={() => setAutoMode(!autoMode)}
            >
              <MaterialCommunityIcons
                name="hand-back-right"
                size={24}
                color={!autoMode ? '#fff' : '#2196F3'}
              />
              <Text
                style={[
                  styles.controlButtonText,
                  !autoMode && styles.controlButtonTextActive,
                ]}
              >
                Manual
              </Text>
            </TouchableOpacity>
          </View>

          {/* Fan Speed */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="fan" size={20} color="#2196F3" />
              <Text style={styles.sectionLabel}>Fan Speed</Text>
            </View>
            <ProgressBar progress={fanSpeed} color="#2196F3" style={styles.progress} />
            <View style={styles.fanControls}>
              <TouchableOpacity
                style={styles.fanButton}
                onPress={() => setFanSpeed(Math.max(0, fanSpeed - 0.2))}
              >
                <MaterialCommunityIcons name="minus" size={24} color="#2196F3" />
              </TouchableOpacity>
              <Text style={styles.fanSpeedText}>
                {Math.round(fanSpeed * 100)}%
              </Text>
              <TouchableOpacity
                style={styles.fanButton}
                onPress={() => setFanSpeed(Math.min(1, fanSpeed + 0.2))}
              >
                <MaterialCommunityIcons name="plus" size={24} color="#2196F3" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Health */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="air-filter" size={20} color="#4CAF50" />
              <Text style={styles.sectionLabel}>Filter Health</Text>
            </View>
            <ProgressBar progress={filterHealth} color="#4CAF50" style={styles.progress} />
            <View style={styles.filterStatusContainer}>
              <MaterialCommunityIcons name="heart-pulse" size={20} color="#4CAF50" />
              <Text style={styles.filterStatus}>
                Healthy – {Math.round(filterHealth * 100)}% remaining
              </Text>
            </View>
          </View>

          {/* Trends Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="chart-line" size={20} color="#9C27B0" />
              <Text style={styles.sectionLabel}>Air Quality Trends</Text>
            </View>
            
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'daily' && styles.activeTab]}
                onPress={() => setActiveTab('daily')}
              >
                <Text style={[styles.tabText, activeTab === 'daily' && styles.activeTabText]}>Daily</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'weekly' && styles.activeTab]}
                onPress={() => setActiveTab('weekly')}
              >
                <Text style={[styles.tabText, activeTab === 'weekly' && styles.activeTabText]}>Weekly</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'monthly' && styles.activeTab]}
                onPress={() => setActiveTab('monthly')}
              >
                <Text style={[styles.tabText, activeTab === 'monthly' && styles.activeTabText]}>Monthly</Text>
              </TouchableOpacity>
            </View>
            
            <LineChart
              data={getActiveData()}
              width={width - 88}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: "#2196F3"
                }
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
            />
            
            {/* Threshold markers */}
            <View style={styles.thresholdContainer}>
              <View style={styles.thresholdItem}>
                <View style={[styles.thresholdDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.thresholdText}>Excellent (50)</Text>
              </View>
              <View style={styles.thresholdItem}>
                <View style={[styles.thresholdDot, { backgroundColor: '#FFC107' }]} />
                <Text style={styles.thresholdText}>Moderate (100)</Text>
              </View>
              <View style={styles.thresholdItem}>
                <View style={[styles.thresholdDot, { backgroundColor: '#F44336' }]} />
                <Text style={styles.thresholdText}>Hazardous (150+)</Text>
              </View>
            </View>
          </View>

          {/* Event Logs */}
          <View style={styles.sectionCard}>
            <View style={[styles.sectionHeader, { justifyContent: 'space-between' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="clipboard-list" size={20} color="#607D8B" />
                <Text style={styles.sectionLabel}>Event Logs</Text>
              </View>
              <TouchableOpacity onPress={exportLogs}>
                <MaterialCommunityIcons name="export" size={20} color="#607D8B" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.toggleLogsButton}
              onPress={() => setShowLogs(!showLogs)}
            >
              <Text style={styles.toggleLogsText}>
                {showLogs ? 'Hide Logs' : 'Show Logs'}
              </Text>
              <MaterialCommunityIcons 
                name={showLogs ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#607D8B" 
              />
            </TouchableOpacity>
            
            {showLogs && (
              <View style={styles.logsContainer}>
                {eventLogs.map((log, index) => (
                  <View key={index} style={styles.logItem}>
                    <View style={[styles.logDot, { backgroundColor: getEventColor(log.level) }]} />
                    <View style={styles.logContent}>
                      <Text style={styles.logTime}>{log.time}</Text>
                      <Text style={styles.logEvent}>{log.event}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
      
      <Snackbar
        visible={showNotification}
        onDismiss={() => setShowNotification(false)}
        duration={4000}
        action={{
          label: 'OK',
          onPress: () => setShowNotification(false),
        }}
        style={{ backgroundColor: '#263238' }}
      >
        {notification}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 30,
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f7fdff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop:5,
  },
  roomText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0d47a1',
    marginTop: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#555',
  },
  aqiContainer: {
    alignSelf: 'center',
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  aqiRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 120,
    borderWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    opacity: 0.3,
  },
  glowOverlay: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 6,
  },
  aqiCard: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  aqiLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  aqiValue: {
    fontSize: 64,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  aqiStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aqiStatus: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 5,
  },
  controlsContainer: {
    marginTop: 20,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2196F3',
    backgroundColor: '#fff',
  },
  controlButtonActive: {
    backgroundColor: '#2196F3',
  },
  controlButtonText: {
    marginLeft: 8,
    color: '#2196F3',
    fontWeight: '500',
  },
  controlButtonTextActive: {
    color: '#fff',
  },
  powerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F44336',
    backgroundColor: '#fff',
  },
  powerButtonActive: {
    backgroundColor: '#F44336',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  progress: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginBottom: 15,
  },
  fanControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fanButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
  },
  fanSpeedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2196F3',
  },
  logoutButton: {
  marginRight: 15,
  padding: 8,
  borderRadius: 20,
  backgroundColor: '#ffe6e6',
},

  filterStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  filterStatus: {
    marginLeft: 8,
    color: '#4CAF50',
    fontWeight: '500',
  },
  // New styles for the added components
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    padding: 4,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: '#9C27B0',
  },
  tabText: {
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  thresholdContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  thresholdItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thresholdDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  thresholdText: {
    fontSize: 12,
    color: '#666',
  },
  toggleLogsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginBottom: 10,
  },
  toggleLogsText: {
    color: '#607D8B',
    fontWeight: '500',
    marginRight: 5,
  },
  logsContainer: {
    marginTop: 5,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  logContent: {
    flex: 1,
  },
  logTime: {
    fontSize: 12,
    color: '#999',
  },
  logEvent: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
});