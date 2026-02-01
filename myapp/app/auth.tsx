import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginSuccess } from '../src/store/slices/authSlice';

export default function AuthScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const dispatch = useDispatch();
  const router = useRouter();

  const handleAuth = async () => {
    if (!username || !password) {
      Alert.alert("Błąd", "Wpisz dane (test / test123)");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://kantoronline.netlify.app/.netlify/functions/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Zapisujemy ID i wchodzimy do aplikacji
        dispatch(loginSuccess({ userId: data.userId }));
        router.replace('/(tabs)/exchange');
      } else {
        Alert.alert("Błąd", data.message || "Błąd serwera");
      }
    } catch (e) {
      Alert.alert("Błąd", "Problem z połączeniem. Sprawdź internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Logowanie</Text>
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
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>ZALOGUJ</Text>}
        </TouchableOpacity>
        <Text style={styles.hint}>Użyj danych dodanych w SQL</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', padding: 25, borderRadius: 15, elevation: 5 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderBottomWidth: 1, borderBottomColor: '#ddd', padding: 12, marginBottom: 20 },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  hint: { marginTop: 15, textAlign: 'center', color: '#888', fontSize: 12 }
});