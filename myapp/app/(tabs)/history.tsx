import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootState } from '../../src/store/store';
import { API_ENDPOINTS } from '../../src/constants/api';

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
  const userId = useSelector((state: RootState) => state.auth.userId);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.HISTORY_GET, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
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
    if (userId) fetchHistory();
  }, [userId]);

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.item}>
      <View>
        <Text style={styles.type}>{item.typ}</Text>
        <Text style={styles.date}>{new Date(item.data).toLocaleString()}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.amount}>-{Number(item.kwota_z).toFixed(2)} {item.waluta_z}</Text>
        <Text style={styles.received}>+{Number(item.kwota_do).toFixed(2)} {item.waluta_do}</Text>
        <Text style={styles.rateText}>Kurs: {Number(item.kurs).toFixed(4)}</Text>
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
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 15 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  item: { 
    backgroundColor: '#fff', padding: 15, borderRadius: 12, 
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2
  },
  type: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  date: { fontSize: 11, color: '#888', marginTop: 4 },
  amount: { color: '#dc3545', fontWeight: '600', fontSize: 14 },
  received: { color: '#28a745', fontWeight: '600', fontSize: 14 },
  rateText: { fontSize: 10, color: '#999', marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});