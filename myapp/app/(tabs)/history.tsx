import React, { useState } from 'react'; 
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router'; 
import { RootState } from '../../src/store/store';
import { API_ENDPOINTS } from '../../src/constants/api';

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false); 
  const { token, userId } = useSelector((state: RootState) => state.auth);

  const fetchHistory = async () => {
    if (!token || !userId) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.HISTORY_GET}?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(React.useCallback(() => { fetchHistory(); }, []));

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Historia transakcji</Text>
      {loading ? <ActivityIndicator size="large" /> : (
        <FlatList
          data={history}
          keyExtractor={(item: any) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View>
                <Text style={styles.pair}>{item.waluta_z} ➔ {item.waluta_do}</Text>
                <Text style={styles.date}>{new Date(item.data).toLocaleString()}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.amount}>-{item.kwota_z} {item.waluta_z}</Text>
                <Text style={styles.receive}>+{item.kwota_do} {item.waluta_do}</Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 15 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  item: { backgroundColor: '#fff', padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, elevation: 2 },
  pair: { fontSize: 16, fontWeight: 'bold' },
  date: { fontSize: 12, color: '#888' },
  amount: { color: '#dc3545', fontWeight: 'bold' },
  receive: { color: '#28a745', fontWeight: 'bold' }
});