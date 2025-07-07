import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface User {
  email: string;
  userName?: string;
  deviceName?: string;
  logs?: AirQualityLog[];
  isLoggedIn?: boolean;
  lastActive?: string;
}

interface AirQualityLog {
  timestamp: string;
  aqi: number;
  status: string;
  action?: string;
}

const AdminScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);

  useEffect(() => {
    const fetchUsersAndSessions = async () => {
      // Get all registered users
      const keys = await AsyncStorage.getAllKeys();
      const usersData: User[] = [];
      const activeUsersList: string[] = [];

      for (const key of keys) {
        if (key.startsWith('user:')) {
          const userData = await AsyncStorage.getItem(key);
          if (userData) {
            const parsedData = JSON.parse(userData);
            const userEmail = key.replace('user:', '');
            
            // Check if user has an active session
            const sessionKey = `session:${userEmail}`;
            const sessionData = await AsyncStorage.getItem(sessionKey);
            const isLoggedIn = !!sessionData;
            
            if (isLoggedIn) {
              activeUsersList.push(userEmail);
            }

            usersData.push({ 
              email: userEmail,
              userName: parsedData.userName,
              deviceName: parsedData.deviceName,
              logs: parsedData.logs || [],
              isLoggedIn,
              lastActive: sessionData ? JSON.parse(sessionData).lastActive : undefined
            });
          }
        }
      }

      setUsers(usersData);
      setActiveUsers(activeUsersList);
    };

    fetchUsersAndSessions();
    
    // Refresh every 30 seconds to get current active users
    const interval = setInterval(fetchUsersAndSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleUserExpansion = (email: string) => {
    setExpandedUser(expandedUser === email ? null : email);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent': return '#4CAF50';
      case 'moderate': return '#FFC107';
      case 'unhealthy': return '#FF9800';
      case 'hazardous': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Registered Users</Text>
      
      {/* Active Users Section */}
      {activeUsers.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currently Active ({activeUsers.length})</Text>
          {users
            .filter(user => activeUsers.includes(user.email))
            .map(user => (
              <View key={`active-${user.email}`} style={[styles.userItem, styles.activeUser]}>
                <View style={styles.userHeader}>
                  <View>
                    <Text style={styles.userText}>
                      <MaterialCommunityIcons name="account" size={16} color="#4CAF50" /> {user.email}
                    </Text>
                    {user.userName && <Text style={styles.userDetail}>Name: {user.userName}</Text>}
                    {user.lastActive && <Text style={styles.userDetail}>Active since: {new Date(user.lastActive).toLocaleString()}</Text>}
                  </View>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>ONLINE</Text>
                  </View>
                </View>
              </View>
            ))
          }
        </View>
      )}

      {/* All Users Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Users ({users.length})</Text>
        {users.length > 0 ? (
          users.map((user) => (
            <View 
              key={user.email} 
              style={[
                styles.userItem, 
                activeUsers.includes(user.email) && styles.activeUserItem
              ]}
            >
              <TouchableOpacity 
                onPress={() => toggleUserExpansion(user.email)}
                style={styles.userHeader}
              >
                <View>
                  <Text style={styles.userText}>
                    {user.email === 'umeramin577@gmail.com' && (
                      <MaterialCommunityIcons name="star" size={16} color="#FFC107" />
                    )}
                    {user.email}
                  </Text>
                  {user.userName && <Text style={styles.userDetail}>Name: {user.userName}</Text>}
                  {user.deviceName && <Text style={styles.userDetail}>Device: {user.deviceName}</Text>}
                </View>
                <View style={styles.userStatus}>
                  {user.isLoggedIn ? (
                    <View style={styles.activeIndicator}>
                      <View style={styles.activePulse} />
                      <Text style={styles.activeText}>Active</Text>
                    </View>
                  ) : (
                    <Text style={styles.inactiveText}>Offline</Text>
                  )}
                  <MaterialCommunityIcons 
                    name={expandedUser === user.email ? "chevron-up" : "chevron-down"} 
                    size={24} 
                    color="white" 
                  />
                </View>
              </TouchableOpacity>

              {expandedUser === user.email && (
                <View style={styles.logsContainer}>
                  <Text style={styles.logsHeader}>Activity Logs ({user.logs?.length || 0})</Text>
                  
                  {user.logs && user.logs.length > 0 ? (
                    user.logs.map((log, index) => (
                      <View key={index} style={styles.logItem}>
                        <View style={styles.logTimestamp}>
                          <Text style={styles.logText}>{new Date(log.timestamp).toLocaleString()}</Text>
                          {log.action && (
                            <MaterialCommunityIcons 
                              name={log.action.includes('on') ? 'power' : 'alert-circle'} 
                              size={16} 
                              color="#2196F3" 
                            />
                          )}
                        </View>
                        <View style={styles.logData}>
                          <Text style={[styles.logText, { color: getStatusColor(log.status) }]}>
                            AQI: {log.aqi} ({log.status})
                          </Text>
                          {log.action && (
                            <Text style={styles.logAction}>{log.action}</Text>
                          )}
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noLogs}>No activity data available</Text>
                  )}
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noUsers}>No users registered yet.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 20,
  },
  header: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 30,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: '#2196F3',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  userItem: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  activeUserItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  activeUser: {
    backgroundColor: '#1a2e22',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 3,
  },
  userDetail: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 2,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  activePulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    marginRight: 5,
  },
  activeText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  inactiveText: {
    color: '#777',
    fontSize: 14,
    marginRight: 10,
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logsContainer: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#555',
    paddingTop: 10,
  },
  logsHeader: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logItem: {
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 5,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logTimestamp: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logData: {
    alignItems: 'flex-end',
  },
  logText: {
    color: 'white',
    fontSize: 14,
    marginRight: 5,
  },
  logAction: {
    color: '#2196F3',
    fontSize: 12,
    marginTop: 3,
    fontStyle: 'italic',
  },
  noLogs: {
    color: '#777',
    fontSize: 14,
    textAlign: 'center',
    padding: 10,
  },
  noUsers: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AdminScreen;