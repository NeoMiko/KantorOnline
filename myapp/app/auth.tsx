import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../src/store/slices/authSlice'; 

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();

  const handleAuth = async () => {
    if (!username.trim() || !password.trim()) {
      const fieldError = "Proszę wypełnić wszystkie pola.";
      if (Platform.OS === 'web') {
        window.alert("Błąd: " + fieldError);
      } else {
        Alert.alert("Błąd", fieldError);
      }
      return;
    }

    setLoading(true);
    const endpoint = isLogin ? 'auth-login' : 'auth-register';
    
    try {
      const response = await fetch(`https://kantoronline.netlify.app/.netlify/functions/${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
            username: username.trim(), 
            password: password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(loginSuccess({ 
          token: data.token, 
          userId: data.userId.toString() 
        }));

        const successTitle = isLogin ? "Witaj!" : "Sukces!";
        const successMsg = isLogin 
          ? `Zalogowano pomyślnie jako ${username}.` 
          : "Konto utworzone! Otrzymałeś 10 000 PLN na start.";

        if (Platform.OS === 'web') {
          window.alert(`${successTitle}\n${successMsg}`);
          router.replace('/(tabs)/exchange');
        } else {
          Alert.alert(successTitle, successMsg, [
            { text: "OK", onPress: () => router.replace('/(tabs)/exchange') }
          ]);
        }

      } else {
        const errorMsg = data.message || "Wystąpił problem z autoryzacją.";
        if (Platform.OS === 'web') {
          window.alert("Błąd: " + errorMsg);
        } else {
          Alert.alert("Błąd", errorMsg);
        }
      }
    } catch (error: any) {
      console.error("DEBUG - Szczegóły błędu logowania:", error);
      
      const connError = error.message === 'Failed to fetch' 
        ? "Błąd połączenia (CORS lub brak serwera). Sprawdź konsolę F12."
        : `Błąd sieci: ${error.message}`;

      if (Platform.OS === 'web') {
        window.alert(connError);
      } else {
        Alert.alert("Problem z połączeniem", connError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>{isLogin ? 'Witaj z powrotem' : 'Stwórz konto'}</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Zaloguj się, aby zarządzać swoim portfelem' : 'Zacznij wymieniać waluty już dziś'}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Login / Nazwa użytkownika</Text>
            <TextInput
              style={styles.input}
              placeholder="Wpisz swój login"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Hasło</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Zaloguj się' : 'Zarejestruj się'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.switchButton} 
            onPress={() => {
                setIsLogin(!isLogin);
                setPassword(''); 
            }}
            disabled={loading}
          >
            <Text style={styles.switchText}>
              {isLogin ? 'Nie masz konta? Zarejestruj się' : 'Masz już konto? Zaloguj się'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1a1a1a', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 30 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8, marginLeft: 4 },
  input: {
    backgroundColor: '#f1f3f5',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: { backgroundColor: '#a0cfff' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  switchButton: { marginTop: 20, alignItems: 'center' },
  switchText: { color: '#007AFF', fontSize: 14, fontWeight: '600' },
});