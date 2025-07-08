import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface User {
  email: string;
  userName?: string;
  deviceName?: string;
  logs?: Array<{
    time: string;
    event: string;
    level: string;
  }>;
  isLoggedIn?: boolean;
  lastActive?: string;
}

const AdminScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

// In AdminScreen.tsx
const fetchUsers = async () => {
  try {
    setRefreshing(true);
    const keys = await AsyncStorage.getAllKeys();
    const usersData: User[] = [];

    // First get all users
    for (const key of keys) {
      if (key.startsWith('user:')) {
        const userEmail = key.replace('user:', '');
        const userData = await AsyncStorage.getItem(key);
        
        if (userData) {
          const parsedData = JSON.parse(userData);
          
          // Check if user has an active session
          const sessionKey = `session:${userEmail}`;
          const sessionData = await AsyncStorage.getItem(sessionKey);
          
          usersData.push({
            email: userEmail,
            userName: parsedData.userName,
            deviceName: parsedData.deviceName,
            logs: parsedData.logs || [],
            isLoggedIn: !!sessionData,
            lastActive: sessionData ? JSON.parse(sessionData).lastActive : undefined
          });
        }
      }
    }

    // Then get all admin logs
    const adminLogsKey = `admin:logs`;
    const adminLogsData = await AsyncStorage.getItem(adminLogsKey);
    const allLogs = adminLogsData ? JSON.parse(adminLogsData) : [];

    // Merge logs into users
    const usersWithLogs = usersData.map(user => {
      const userLogs = allLogs.filter((log: any) => log.email === user.email);
      return {
        ...user,
        allLogs: [...(user.logs || []), ...userLogs].sort((a, b) => 
          new Date(b.time).getTime() - new Date(a.time).getTime()
        )
      };
    });

    setUsers(usersWithLogs);
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    setRefreshing(false);
  }
};

  useEffect(() => {
    fetchUsers();
  }, []);

  const getEventColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'info': return '#2196F3';
      default: return '#4CAF50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchUsers} />
      }
    >
      <Text style={styles.header}>User Management</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Users ({users.length})</Text>
        
        {users.length === 0 ? (
          <Text style={styles.noUsers}>No users found</Text>
        ) : (
          users.map((user) => (
            <View 
              key={user.email} 
              style={[
                styles.userCard,
                user.isLoggedIn && styles.activeUserCard
              ]}
            >
              <TouchableOpacity
                style={styles.userHeader}
                onPress={() => setExpandedUser(expandedUser === user.email ? null : user.email)}
              >
                <View style={styles.userInfo}>
                  <Text style={styles.userEmail}>
                    {user.email === 'admin' && (
                      <MaterialCommunityIcons name="shield-account" size={16} color="#FFC107" />
                    )}
                    {' '}{user.email}
                  </Text>
                  {user.userName && <Text style={styles.userDetail}>Name: {user.userName}</Text>}
                  {user.deviceName && <Text style={styles.userDetail}>Device: {user.deviceName}</Text>}
                </View>
                
                <View style={styles.userStatus}>
                  {user.isLoggedIn ? (
                    <View style={styles.activeStatus}>
                      <View style={styles.activeDot} />
                      <Text style={styles.activeText}>Online</Text>
                    </View>
                  ) : (
                    <Text style={styles.inactiveText}>Offline</Text>
                  )}
                  <MaterialCommunityIcons 
                    name={expandedUser === user.email ? 'chevron-up' : 'chevron-down'} 
                    size={24} 
                    color="#666" 
                  />
                </View>
              </TouchableOpacity>

              {expandedUser === user.email && (
                <View style={styles.logsContainer}>
                  <Text style={styles.logsTitle}>Activity Logs ({user.logs?.length || 0})</Text>
                  
                  {user.logs && user.logs.length > 0 ? (
                    user.logs.map((log, index) => (
                      <View key={index} style={styles.logItem}>
                        <View style={styles.logTimeContainer}>
                          <Text style={styles.logTime}>{formatDate(log.time)}</Text>
                          <View style={[styles.logLevel, { backgroundColor: getEventColor(log.level) }]} />
                        </View>
                        <Text style={styles.logEvent}>{log.event}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noLogs}>No activity logs available</Text>
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#555',
  },
  noUsers: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeUserCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
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
  logsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  logItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  logTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logTime: {
    fontSize: 12,
    color: '#666',
  },
  logLevel: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  logEvent: {
    fontSize: 14,
    color: '#333',
  },
  noLogs: {
    textAlign: 'center',
    color: '#777',
    padding: 12,
  },
});

export default AdminScreen;