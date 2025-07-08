import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Admin hardcoded check
    if (email.toLowerCase() === 'admin' && password === '123') {
      // Create session for admin
      const sessionData = {
        lastActive: new Date().toISOString(),
        isActive: true
      };
      await AsyncStorage.setItem(`session:admin`, JSON.stringify(sessionData));
      
      Alert.alert('Success', 'Admin logged in!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('AdminScreen'),
        },
      ]);
      return;
    }

    try {
      const userData = await AsyncStorage.getItem(`user:${email}`);
      if (userData === null) {
        Alert.alert('Error', 'User not found!');
        return;
      }

      const parsedData = JSON.parse(userData);
      if (parsedData.password !== password) {
        Alert.alert('Error', 'Incorrect password!');
        return;
      }

      // Create session for regular user
      const sessionData = {
        lastActive: new Date().toISOString(),
        isActive: true
      };
      await AsyncStorage.setItem(`session:${email}`, JSON.stringify(sessionData));

      // Add login log entry
      const logEntry = {
        time: new Date().toISOString(),
        event: 'User logged in',
        level: 'info'
      };
      const updatedLogs = [logEntry, ...(parsedData.logs || [])];
      await AsyncStorage.mergeItem(`user:${email}`, JSON.stringify({ logs: updatedLogs }));

      Alert.alert('Success', 'Logged in successfully!', [
        {
          text: 'OK',
          onPress: () =>
            navigation.navigate('MainApp', {
              screen: 'Dashboard',
              params: {
                email,
                userName: parsedData.userName,
                deviceName: parsedData.deviceName,
              },
            }),
        },
      ]);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to login');
      console.error(error);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'skyblue' }} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.welcomeSection}>
        <Text style={styles.title}>
          <Text style={styles.welcome}>Breathe</Text>
          <Text style={styles.normalText}> Pure</Text>
        </Text>
      </View>

      <View style={styles.loginSection}>
        <View style={styles.inputContainer}>
          <Icon name="envelope" size={20} color="#ff6666" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="lock" size={24} color="#777" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon name={showPassword ? 'eye-slash' : 'eye'} size={20} color="#777" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={[styles.footerText, styles.footerLink]}> Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  welcomeSection: {
    height: SCREEN_HEIGHT * 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'skyblue',
  },
  loginSection: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 40,
    minHeight: SCREEN_HEIGHT * 0.8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  welcome: {
    color: 'green',
  },
  normalText: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 20,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#34A853',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    fontSize: 16,
    color: '#666',
  },
  footerLink: {
    color: '#4285F4',
    fontWeight: 'bold',
  },
});

export default LoginScreen;