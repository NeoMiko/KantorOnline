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
  const { userId, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [transactionType, setTransactionType] = useState<'KUPNO' | 'SPRZEDAZ'>('KUPNO');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCurrentRates());
      const interval = setInterval(() => dispatch(fetchCurrentRates()), 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleExchange = async () => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Błąd', 'Wpisz poprawną kwotę');
      return;
    }

    if (!userId) {
      Alert.alert('Błąd', 'Użytkownik nie jest zalogowany');
      return;
    }

    const rateData = rates.find(r => r.waluta_skrot === selectedCurrency);
    if (!rateData) return;

    const currentRate = transactionType === 'KUPNO' ? rateData.kurs_sprzedazy : rateData.kurs_kupna;

    setIsProcessing(true);
    const result = await dispatch(executeExchange(
      transactionType === 'KUPNO' ? 'PLN' : selectedCurrency,
      transactionType === 'KUPNO' ? selectedCurrency : 'PLN',
      numAmount,
      currentRate,
      userId
    ));
    setIsProcessing(false);

    if (result.success) {
      Alert.alert('Sukces', result.message);
      setAmount('');
    } else {
      Alert.alert('Błąd', result.message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Kantor Online</Text>
        
        <View style={styles.formCard}>
          <View style={styles.typeSelector}>
            <TouchableOpacity 
              style={[styles.typeBtn, transactionType === 'KUPNO' && styles.buyActive]} 
              onPress={() => setTransactionType('KUPNO')}
            >
              <Text style={[styles.typeBtnText, transactionType === 'KUPNO' && styles.textWhite]}>CHCE KUPIĆ</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.typeBtn, transactionType === 'SPRZEDAZ' && styles.sellActive]} 
              onPress={() => setTransactionType('SPRZEDAZ')}
            >
              <Text style={[styles.typeBtnText, transactionType === 'SPRZEDAZ' && styles.textWhite]}>CHCE SPRZEDAĆ</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Wybierz walutę:</Text>
            <View style={styles.currencyGrid}>
              {rates.map(r => (
                <TouchableOpacity 
                  key={r.waluta_skrot}
                  style={[styles.currencyItem, selectedCurrency === r.waluta_skrot && styles.currencySelected]}
                  onPress={() => setSelectedCurrency(r.waluta_skrot)}
                >
                  <Text style={selectedCurrency === r.waluta_skrot ? styles.textWhite : null}>{r.waluta_skrot}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Kwota ({transactionType === 'KUPNO' ? 'PLN' : selectedCurrency}):</Text>
            <TextInput 
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0.00"
            />
          </View>

          <TouchableOpacity style={styles.mainBtn} onPress={handleExchange} disabled={isProcessing}>
            {isProcessing ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>WYKONAJ TRANSAKCJĘ</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  scroll: { padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  formCard: { backgroundColor: '#fff', borderRadius: 15, padding: 20, elevation: 4 },
  typeSelector: { flexDirection: 'row', marginBottom: 20, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' },
  typeBtn: { flex: 1, padding: 15, alignItems: 'center', backgroundColor: '#f8f9fa' },
  typeBtnText: { fontWeight: 'bold', color: '#666' },
  buyActive: { backgroundColor: '#28a745' },
  sellActive: { backgroundColor: '#dc3545' },
  textWhite: { color: '#fff' },
  label: { fontSize: 14, color: '#888', marginBottom: 10 },
  currencyGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  currencyItem: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, width: '22%', alignItems: 'center' },
  currencySelected: { backgroundColor: '#007bff', borderColor: '#007bff' },
  inputWrapper: { marginBottom: 20 },
  input: { borderBottomWidth: 2, borderBottomColor: '#007bff', fontSize: 22, paddingVertical: 5, fontWeight: 'bold' },
  mainBtn: { backgroundColor: '#007bff', padding: 18, borderRadius: 10, alignItems: 'center' },
  mainBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});