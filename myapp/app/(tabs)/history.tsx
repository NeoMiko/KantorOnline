import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootState } from '../../src/store/store';

interface Transaction {
  id: number;
  typ: string;
  waluta_z: string;
  waluta_do: string;
  kwota_z: string | number;
  kwota_do: string | number;
  kurs: string | number;
  data: string;
}

export default function HistoryScreen() {

  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  const token = useSelector((state: RootState) => state.auth.token);
  
  const API_URL = "https://kantoronline.netlify.app/.netlify/functions";

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/history-get`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setHistory(data.history || []);
    } catch (e) {
      console.error("Błąd pobierania historii:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchHistory();
  }, [token]);

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.item}>
      <View>
        <Text style={styles.date}>{new Date(item.data).toLocaleString()}</Text>
        <Text style={styles.pair}>{item.waluta_z} ➔ {item.waluta_do}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.amount}>-{Number(item.kwota_z).toFixed(2)} {item.waluta_z}</Text>
        <Text style={styles.received}>+{Number(item.kwota_do).toFixed(2)} {item.waluta_do}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Ostatnie transakcje</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>Brak transakcji w historii.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 15 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, paddingHorizontal: 5 },
  item: { 
    backgroundColor: '#fff', padding: 15, borderRadius: 12, 
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4
  },
  date: { fontSize: 11, color: '#888', marginBottom: 4 },
  pair: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  amount: { color: '#dc3545', fontWeight: '700', fontSize: 14 },
  received: { color: '#28a745', fontWeight: '700', fontSize: 14, marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 }
});