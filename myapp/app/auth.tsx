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
      Alert.alert("Błąd", "Proszę wypełnić wszystkie pola.");
      return;
    }

    if (password.length < 6 && !isLogin) {
      Alert.alert("Błąd", "Hasło musi mieć co najmniej 6 znaków.");
      return;
    }

    setLoading(true);
    const endpoint = isLogin ? 'auth-login' : 'auth-register';
    
    try {
      const response = await fetch(`https://kantoronline.netlify.app/.netlify/functions/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            username: username.trim(), 
            password: password 
        }),
      });

      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error("Serwer zwrócił niepoprawny format danych.");
      }

      if (response.ok) {
        if (isLogin) {
         
          dispatch(loginSuccess({ 
            token: data.token, 
            userId: data.userId.toString() 
          }));
          
          Alert.alert("Sukces", `Witaj ponownie, ${username}!`);
          router.replace('/(tabs)/exchange');
        } else {
        
          dispatch(loginSuccess({ 
            token: data.token, 
            userId: data.userId.toString() 
          }));

          Alert.alert(
            "Konto utworzone!", 
            "Twoja rejestracja przebiegła pomyślnie. Na start otrzymujesz 10 000 PLN!",
            [{ 
              text: "Zaczynamy!", 
              onPress: () => router.replace('/(tabs)/exchange') 
            }]
          );
        }
      } else {
        
        Alert.alert("Błąd", data.message || "Wystąpił problem z autoryzacją.");
      }
    } catch (error: any) {
      console.error("BŁĄD AUTH:", error);
      Alert.alert(
        "Błąd połączenia", 
        "Nie udało się skontaktować z serwerem. Sprawdź połączenie z internetem."
      );
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