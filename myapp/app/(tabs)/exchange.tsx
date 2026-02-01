import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { RootState, AppDispatch } from '../../src/store/store';
import { fetchCurrentRates } from '../../src/services/rateService';
import { executeExchange } from '../../src/services/exchangeService';

export default function ExchangeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  
  const { rates, isLoading, lastUpdated } = useSelector((state: RootState) => state.rates);
  const { token, userId, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [transactionType, setTransactionType] = useState<'KUPNO' | 'SPRZEDAZ'>('KUPNO');
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Odświeżanie co 1 minutę (60000ms)
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCurrentRates());
      const interval = setInterval(() => {
        dispatch(fetchCurrentRates());
      }, 60000); 
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, dispatch]);

  const currentRateObj = rates.find(r => r.waluta_skrot === selectedCurrency);
  const activeRate = transactionType === 'KUPNO' ? currentRateObj?.kurs_sprzedazy : currentRateObj?.kurs_kupna;

  const handleExchange = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Błąd', 'Wprowadź poprawną kwotę.');
      return;
    }

    setIsProcessing(true);
    const result = await dispatch(executeExchange(
      transactionType === 'KUPNO' ? 'PLN' : selectedCurrency,
      transactionType === 'KUPNO' ? selectedCurrency : 'PLN',
      numAmount,
      activeRate || 0,
      token!,
      userId!
    ));
    setIsProcessing(false);

    if (result.success) {
      Alert.alert('Sukces', result.message);
      setAmount('');
    } else {
      Alert.alert('Błąd transakcji', result.message);
    }
  };

  // Formatowanie daty ostatniej aktualizacji
  const formatTime = (isoString: string | null) => {
    if (!isoString) return '--:--:--';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header Sekcja Kursów */}
        <View style={styles.headerRow}>
          <Text style={styles.mainTitle}>Kursy Walut NBP</Text>
          <View style={styles.refreshBadge}>
            <MaterialCommunityIcons name="clock-outline" size={14} color="#666" />
            <Text style={styles.lastUpdateText}> Aktualizacja: {formatTime(lastUpdated)}</Text>
          </View>
        </View>

        {/* Tabela Kursów */}
        <View style={styles.ratesCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { textAlign: 'left' }]}>Waluta</Text>
            <Text style={styles.headerCell}>Kupno</Text>
            <Text style={styles.headerCell}>Sprzedaż</Text>
          </View>
          
          {rates.map((rate) => (
            <TouchableOpacity 
              key={rate.waluta_skrot} 
              style={[styles.rateRow, selectedCurrency === rate.waluta_skrot && styles.selectedRow]}
              onPress={() => setSelectedCurrency(rate.waluta_skrot)}
            >
              <Text style={styles.currencyCode}>{rate.waluta_skrot}</Text>
              <Text style={styles.rateValue}>{rate.kurs_kupna.toFixed(4)}</Text>
              <Text style={styles.rateValue}>{rate.kurs_sprzedazy.toFixed(4)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Formularz Wymiany */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Zrealizuj wymianę</Text>
          
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kwota ({transactionType === 'KUPNO' ? 'PLN' : selectedCurrency})</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          {activeRate && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>Kurs operacji: <Text style={styles.bold}>{activeRate.toFixed(4)}</Text></Text>
              <Text style={styles.infoText}>Otrzymasz ok.: <Text style={styles.bold}>
                {amount ? (transactionType === 'KUPNO' ? (parseFloat(amount)/activeRate) : (parseFloat(amount)*activeRate)).toFixed(2) : '0.00'} 
                {transactionType === 'KUPNO' ? ` ${selectedCurrency}` : ' PLN'}
              </Text></Text>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.submitBtn, isProcessing && styles.disabledBtn]} 
            onPress={handleExchange}
            disabled={isProcessing}
          >
            {isProcessing ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Potwierdź Wymianę</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FA', paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20 },
  mainTitle: { fontSize: 24, fontWeight: '800', color: '#1A1C1E' },
  refreshBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E2E8F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  lastUpdateText: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  
  ratesCard: { backgroundColor: '#fff', borderRadius: 16, padding: 8, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  tableHeader: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerCell: { flex: 1, fontSize: 12, color: '#94A3B8', fontWeight: '700', textAlign: 'center', textTransform: 'uppercase' },
  rateRow: { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 12, borderRadius: 12, alignItems: 'center' },
  selectedRow: { backgroundColor: '#F0F7FF', borderWidth: 1, borderColor: '#3B82F6' },
  currencyCode: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1E293B' },
  rateValue: { flex: 1, fontSize: 15, fontWeight: '500', color: '#334155', textAlign: 'center' },

  formCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15, elevation: 5, marginBottom: 40 },
  formTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20, color: '#1E293B' },
  typeSelector: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 24 },
  typeBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  typeBtnText: { fontWeight: '700', color: '#64748B' },
  buyActive: { backgroundColor: '#10B981' },
  sellActive: { backgroundColor: '#EF4444' },
  textWhite: { color: '#fff' },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#64748B', marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 16, fontSize: 20, fontWeight: '700', color: '#1E293B' },
  
  infoBox: { backgroundColor: '#F0F9FF', padding: 16, borderRadius: 12, marginBottom: 24 },
  infoText: { fontSize: 14, color: '#0369A1', marginBottom: 4 },
  bold: { fontWeight: '800' },

  submitBtn: { backgroundColor: '#3B82F6', paddingVertical: 18, borderRadius: 12, alignItems: 'center', shadowColor: '#3B82F6', shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  disabledBtn: { backgroundColor: '#94A3B8' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});