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

const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !userName || !deviceName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const existingUser = await AsyncStorage.getItem(email);
      if (existingUser !== null) {
        Alert.alert('Error', 'User already exists!');
        return;
      }

      // Storing user data including username and device name
      const userData = { password, userName, deviceName };
      await AsyncStorage.setItem(email, JSON.stringify(userData));

      Alert.alert('Success', 'Account created successfully!');
      // After successful signup
navigation.navigate('MainApp', {
  screen: 'Dashboard',
  params: { email }
});
    } catch (error) {
      Alert.alert('Error', 'Failed to sign up');
      console.error(error);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'skyblue' }} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.welcomeSection}>
        <Text style={styles.title}>
          <Text style={styles.welcome}>Join</Text>
          <Text style={styles.normalText}> Pure</Text>
        </Text>
      </View>

      <View style={styles.signupSection}>
        <View style={styles.inputContainer}>
          <Icon name="user" size={20} color="green" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="User Name"
            value={userName}
            onChangeText={setUserName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="tablet" size={20} color="green" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Device Name"
            value={deviceName}
            onChangeText={setDeviceName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="envelope" size={20} color="green" style={styles.icon} />
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

        <View style={styles.inputContainer}>
          <Icon name="lock" size={24} color="#777" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.footerText, styles.footerLink]}> Log In</Text>
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
  signupSection: {
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

export default SignUpScreen;