import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const dispatch = useDispatch();
  const router = useRouter();

  const API_URL = "https://kantoronline.netlify.app/.netlify/functions";

  const handleAuth = async () => {
    if (!username || !password) {
      Alert.alert("Błąd", "Wypełnij wszystkie pola");
      return;
    }

    setLoading(true);
    const endpoint = isLogin ? '/login' : '/register';

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          dispatch({ 
            type: 'auth/loginSuccess', 
            payload: { token: data.token, userId: data.userId } 
          });
          router.replace('/exchange');
        } else {
          Alert.alert("Sukces", "Konto utworzone. Zaloguj się.");
          setIsLogin(true);
        }
      } else {
        Alert.alert("Błąd", data.message);
      }
    } catch (error) {
      Alert.alert("Błąd połączenia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{isLogin ? 'Logowanie' : 'Rejestracja'}</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Użytkownik"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Hasło"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isLogin ? 'ZALOGUJ' : 'ZAREJESTRUJ'}</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switch}>
          <Text style={styles.switchText}>
            {isLogin ? 'Nie masz konta? Zarejestruj się' : 'Masz konto? Zaloguj się'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 5 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#007bff' },
  input: { borderBottomWidth: 1, borderBottomColor: '#ddd', padding: 10, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  switch: { marginTop: 20, alignItems: 'center' },
  switchText: { color: '#666' }
});