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
      {loading ? <ActivityIndicator size="large" color="#007bff" /> : (
        <FlatList
          data={history}
          keyExtractor={(item: any) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.leftColumn}>
                <Text style={styles.pair}>{item.waluta_z} ➔ {item.waluta_do}</Text>
                <Text style={styles.date}>{new Date(item.data).toLocaleString()}</Text>
            
                <Text style={styles.rate}>Kurs: {parseFloat(item.kurs).toFixed(4)}</Text>
              </View>
              
              <View style={styles.rightColumn}>
                <Text style={styles.amount}>-{parseFloat(item.kwota_z).toFixed(2)} {item.waluta_z}</Text>
                <Text style={styles.receive}>+{parseFloat(item.kwota_do).toFixed(2)} {item.waluta_do}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Brak historii transakcji.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 15 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  item: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 10, 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leftColumn: { flex: 1 },
  rightColumn: { alignItems: 'flex-end', justifyContent: 'center' },
  pair: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  date: { fontSize: 12, color: '#888', marginTop: 2 },
  rate: { 
    fontSize: 12, 
    color: '#007bff', 
    fontWeight: '600', 
    marginTop: 4,
    backgroundColor: '#eef6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start'
  },
  amount: { color: '#dc3545', fontWeight: 'bold', fontSize: 14 },
  receive: { color: '#28a745', fontWeight: 'bold', fontSize: 14, marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 20, color: '#888' }
});