import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';

import { RootState, AppDispatch } from '../../src/store/store';
import { fetchCurrentRates } from '../../src/services/rateService';
import { executeExchange } from '../../src/services/exchangeService';

export default function ExchangeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  
  // Dane z Redux
  const { rates, isLoading, lastUpdated } = useSelector((state: RootState) => state.rates);
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Stan formularza
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [transactionType, setTransactionType] = useState<'KUPNO' | 'SPRZEDAZ'>('KUPNO');
  const [isProcessing, setIsProcessing] = useState(false);

  // Aktualizacja kursow z NBP 
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCurrentRates());
      const interval = setInterval(() => dispatch(fetchCurrentRates()), 600000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, dispatch]);


  const currentRateObj = rates.find(r => r.waluta_skrot === selectedCurrency);
  const activeRate = transactionType === 'KUPNO' 
    ? currentRateObj?.kurs_sprzedazy 
    : currentRateObj?.kurs_kupna;

  // Obliczenie wyniku transakcji
  const result = (amount && activeRate) 
    ? (transactionType === 'KUPNO' ? parseFloat(amount) / activeRate : parseFloat(amount) * activeRate)
    : 0;

  const handleTransaction = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert("Błąd", "Wpisz poprawną kwotę.");
      return;
    }

    if (!activeRate || !token) return;

    setIsProcessing(true);

    const fromCur = transactionType === 'KUPNO' ? 'PLN' : selectedCurrency;
    const toCur = transactionType === 'KUPNO' ? selectedCurrency : 'PLN';

    const response = await dispatch(executeExchange(fromCur, toCur, numAmount, activeRate, token));
    
    setIsProcessing(false);

    if (response.success) {
      Alert.alert("Sukces", response.message);
      setAmount('');
    } else {
      Alert.alert("Błąd", response.message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Aktualne Kursy Wymiany (PLN)</Text>
          <Text style={styles.lastUpdate}>Ostatnia aktualizacja: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '--:--'}</Text>
        </View>

        {/* TABELA KURSÓW */}
        <View style={styles.tableCard}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.headerCell, { textAlign: 'left' }]}>Waluta</Text>
            <Text style={[styles.cell, styles.headerCell]}>Kupno</Text>
            <Text style={[styles.cell, styles.headerCell]}>Sprzedaż</Text>
          </View>
          {rates.map((rate) => (
            <TouchableOpacity 
              key={rate.waluta_skrot} 
              style={[styles.row, selectedCurrency === rate.waluta_skrot && styles.selectedRow]}
              onPress={() => setSelectedCurrency(rate.waluta_skrot)}
            >
              <Text style={[styles.cell, styles.bold, { textAlign: 'left' }]}>{rate.waluta_skrot}</Text>
              <Text style={styles.cell}>{rate.kurs_kupna.toFixed(4)}</Text>
              <Text style={styles.cell}>{rate.kurs_sprzedazy.toFixed(4)}</Text>
            </TouchableOpacity>
          ))}
        </View>

      
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Nowe Zlecenie: {selectedCurrency}</Text>
          
          <View style={styles.typeSelector}>
            <TouchableOpacity 
              style={[styles.typeBtn, transactionType === 'KUPNO' && styles.buyActive]}
              onPress={() => setTransactionType('KUPNO')}
            >
              <Text style={[styles.typeBtnText, transactionType === 'KUPNO' && styles.textWhite]}>Chcę Kupić</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.typeBtn, transactionType === 'SPRZEDAZ' && styles.sellActive]}
              onPress={() => setTransactionType('SPRZEDAZ')}
            >
              <Text style={[styles.typeBtnText, transactionType === 'SPRZEDAZ' && styles.textWhite]}>Chcę Sprzedać</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Kwota ({transactionType === 'KUPNO' ? 'PLN' : selectedCurrency}):</Text>
            <TextInput
              style={styles.input}
              placeholder="Wpisz kwotę..."
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>
              {transactionType === 'KUPNO' ? 'Otrzymasz około:' : 'Otrzymasz (PLN):'}
            </Text>
            <Text style={styles.resultValue}>
              {result.toFixed(2)} {transactionType === 'KUPNO' ? selectedCurrency : 'PLN'}
            </Text>
            <Text style={styles.rateInfo}>Po kursie: {activeRate?.toFixed(4)}</Text>
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, transactionType === 'KUPNO' ? styles.buyActive : styles.sellActive]} 
            onPress={handleTransaction}
            disabled={isProcessing}
          >
            {isProcessing ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>POTWIERDŹ TRANSAKCJĘ</Text>}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  scrollContent: { padding: 16 },
  headerSection: { marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  lastUpdate: { fontSize: 12, color: '#666' },
  
  tableCard: { backgroundColor: '#fff', borderRadius: 8, elevation: 2, marginBottom: 20, overflow: 'hidden' },
  row: { flexDirection: 'row', padding: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  selectedRow: { backgroundColor: '#eef6ff' },
  headerRow: { backgroundColor: '#007bff' },
  headerCell: { flex: 1, color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  cell: { flex: 1, textAlign: 'center', color: '#444' },
  bold: { fontWeight: 'bold' },

  formCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 4 },
  formTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  typeSelector: { flexDirection: 'row', marginBottom: 20, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#ddd' },
  typeBtn: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: '#f8f9fa' },
  typeBtnText: { fontWeight: '600', color: '#666' },
  buyActive: { backgroundColor: '#28a745' },
  sellActive: { backgroundColor: '#dc3545' },
  textWhite: { color: '#fff' },

  inputWrapper: { marginBottom: 15 },
  label: { fontSize: 13, color: '#666', marginBottom: 5 },
  input: { borderBottomWidth: 2, borderBottomColor: '#007bff', fontSize: 18, paddingVertical: 8, fontWeight: 'bold' },
  
  resultBox: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 8, marginBottom: 20, alignItems: 'center' },
  resultLabel: { fontSize: 12, color: '#666' },
  resultValue: { fontSize: 22, fontWeight: 'bold', color: '#333', marginVertical: 4 },
  rateInfo: { fontSize: 11, color: '#999' },

  submitBtn: { padding: 16, borderRadius: 8, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});