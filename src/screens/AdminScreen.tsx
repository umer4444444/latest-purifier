// screens/AdminScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminScreen = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const keys = await AsyncStorage.getAllKeys();
      const usersData: any[] = [];

      for (const key of keys) {
        if (key !== 'admin') {  // Skip admin (if stored separately)
          const userData = await AsyncStorage.getItem(key);
          if (userData) {
            usersData.push({ email: key, ...JSON.parse(userData) });
          }
        }
      }

      setUsers(usersData);
    };

    fetchUsers();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Registered Users</Text>
      {users.length > 0 ? (
        users.map((user, index) => (
          <View key={index} style={styles.userItem}>
            <Text style={styles.userText}>Email: {user.email}</Text>
            <Text style={styles.userText}>Name: {user.userName}</Text>
            <Text style={styles.userText}>Device: {user.deviceName}</Text>
            <Text style={styles.separator}></Text>
          </View>
        ))
      ) : (
        <Text style={styles.noUsers}>No users registered yet.</Text>
      )}
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
    marginTop:30,
  },
  userItem: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  userText: {
    color: 'white',
    fontSize: 16,
  },
  separator: {
    marginTop: 5,
    borderBottomWidth: 1,
    borderColor: '#777',
  },
  noUsers: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AdminScreen;
