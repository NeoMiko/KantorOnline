import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginSuccess } from '../src/store/slices/authSlice';

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      // Sprawdzamy czy odpowiedź to JSON
      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error("Serwer nie zwrócił formatu JSON. Sprawdź logi Netlify.");
      }

      if (response.ok) {
        // Zapisujemy userId w Redux (bez tokena)
        dispatch(loginSuccess({ userId: data.userId }));
        
        Alert.alert("Sukces", isLogin ? "Zalogowano pomyślnie!" : "Konto utworzone!");
        router.replace('/(tabs)/exchange');
      } else {
        Alert.alert("Błąd", data.message || "Błąd autoryzacji");
      }
    } catch (e: any) {
      console.error("Auth error:", e);
      Alert.alert("Błąd", e.message || "Problem z połączeniem.");
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
          placeholder="Nazwa użytkownika"
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

        <TouchableOpacity 
          style={[styles.button, loading && { opacity: 0.7 }]} 
          onPress={handleAuth} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isLogin ? 'ZALOGUJ' : 'ZAREJESTRUJ'}</Text>
          )}
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
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#007bff' },
  input: { borderBottomWidth: 1, borderBottomColor: '#ddd', padding: 10, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  switch: { marginTop: 20, alignItems: 'center' },
  switchText: { color: '#007bff', fontSize: 14 },
});