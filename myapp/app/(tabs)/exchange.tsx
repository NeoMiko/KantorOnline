import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootState, AppDispatch } from '../../src/store/store';
import { fetchCurrentRates } from '../../src/services/rateService';
import { executeExchange } from '../../src/services/exchangeService';

export default function ExchangeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { rates, isLoading } = useSelector((state: RootState) => state.rates);
  const { token, userId, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [transactionType, setTransactionType] = useState<'KUPNO' | 'SPRZEDAZ'>('KUPNO');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCurrentRates());
    }
  }, [isAuthenticated]);

  const currentRateObj = rates.find(r => r.waluta_skrot === selectedCurrency);
  const activeRate = transactionType === 'KUPNO' ? currentRateObj?.kurs_sprzedazy : currentRateObj?.kurs_kupna;

  const handleExchange = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0 || !activeRate || !token || !userId) {
      Alert.alert("Błąd", "Wprowadź poprawną kwotę.");
      return;
    }

    setIsProcessing(true);
    const result = await dispatch(executeExchange(
      transactionType === 'KUPNO' ? 'PLN' : selectedCurrency,
      transactionType === 'KUPNO' ? selectedCurrency : 'PLN',
      numAmount,
      activeRate,
      token,
      userId
    ));

    setIsProcessing(false);
    if (result.success) {
      Alert.alert("Sukces", result.message);
      setAmount('');
    } else {
      Alert.alert("Błąd transakcji", result.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.ratesCard}>
          <Text style={styles.title}>Kursy walut</Text>
          {rates.map(rate => (
            <TouchableOpacity 
              key={rate.waluta_skrot} 
              style={[styles.rateRow, selectedCurrency === rate.waluta_skrot && styles.selectedRow]}
              onPress={() => setSelectedCurrency(rate.waluta_skrot)}
            >
              <Text style={styles.currencyName}>{rate.waluta_skrot}</Text>
              <Text>Kupno: {rate.kurs_kupna.toFixed(4)}</Text>
              <Text>Sprzedaż: {rate.kurs_sprzedazy.toFixed(4)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Wymiana {selectedCurrency}</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity 
              style={[styles.typeBtn, transactionType === 'KUPNO' && styles.buyActive]} 
              onPress={() => setTransactionType('KUPNO')}
            >
              <Text style={transactionType === 'KUPNO' && styles.textWhite}>KUPNO</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.typeBtn, transactionType === 'SPRZEDAZ' && styles.sellActive]} 
              onPress={() => setTransactionType('SPRZEDAZ')}
            >
              <Text style={transactionType === 'SPRZEDAZ' && styles.textWhite}>SPRZEDAŻ</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Kwota"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          
          <TouchableOpacity style={styles.submitBtn} onPress={handleExchange} disabled={isProcessing}>
            {isProcessing ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Potwierdź transakcję</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 15 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  ratesCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 20, elevation: 2 },
  rateRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  selectedRow: { backgroundColor: '#eef6ff' },
  currencyName: { fontWeight: 'bold', width: 50 },
  formCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 4 },
  formTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  typeSelector: { flexDirection: 'row', marginBottom: 20, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#ddd' },
  typeBtn: { flex: 1, padding: 12, alignItems: 'center' },
  buyActive: { backgroundColor: '#28a745' },
  sellActive: { backgroundColor: '#dc3545' },
  textWhite: { color: '#fff', fontWeight: 'bold' },
  input: { borderBottomWidth: 2, borderBottomColor: '#007bff', fontSize: 20, paddingVertical: 10, textAlign: 'center', marginBottom: 20 },
  submitBtn: { backgroundColor: '#007bff', padding: 15, borderRadius: 10, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});