// Imports
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PaperProvider } from 'react-native-paper';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AQIComparisonScreen from '../screens/AQIComparisonScreen';
import AdminScreen from '../screens/AdminScreen';
import AirQualityScreen from '../screens/AirQualityScreen'; // 👈 NEW
import DHT22Screen from '../screens/DHT22Screen'; // 👈 Import the new screen


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ✅ 1. Define AuthStack first
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="AdminScreen" component={AdminScreen} />
    </Stack.Navigator>
  );
}

// ✅ 2. Define MainTabs next
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1e88e5',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: '#ccc',
          paddingBottom: 4,
          height: 60,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'menu';
          if (route.name === 'Dashboard') {
            iconName = 'air-filter';
          } else if (route.name === 'Comparison') {
            iconName = 'chart-bar';
          } else if (route.name === 'AirQuality') {
            iconName = 'weather-hazy';
          }

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Comparison" component={AQIComparisonScreen} />
      <Tab.Screen name="AirQuality" component={AirQualityScreen} /> 
      <Tab.Screen name="DHT22" component={DHT22Screen} />

    </Tab.Navigator>
  );
}

// ✅ 3. Now AppNavigator can use AuthStack and MainTabs
export default function AppNavigator() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Auth"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Auth" component={AuthStack} />
          <Stack.Screen name="MainApp" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
