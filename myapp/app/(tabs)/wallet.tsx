import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { FontAwesome } from '@expo/vector-icons';

import { RootState, AppDispatch } from '../../src/store/store'; 
import { fetchWalletBalances } from '../../src/services/walletService';

export default function WalletScreen() {
  const dispatch = useDispatch<AppDispatch>();
  
  const { balances, isLoading, error } = useSelector((state: RootState) => state.wallet);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    let isMounted = true;

    if (isAuthenticated && isMounted) {
        dispatch(fetchWalletBalances());
    }

    return () => { isMounted = false; };
}, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
        <SafeAreaView style={styles.center} edges={['top', 'bottom']}>
            <FontAwesome name="lock" size={40} color="#dc3545" style={{ marginBottom: 10 }} />
            <Text style={styles.errorText}>Wymagana Autoryzacja.</Text>
            <Text style={styles.subText}>Zaloguj się, aby zobaczyć swoje salda.</Text>
        </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
        <SafeAreaView style={styles.center} edges={['top', 'bottom']}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Pobieranie sald...</Text>
        </SafeAreaView>
    );
  }

  if (error) {
    return (
        <SafeAreaView style={styles.center} edges={['top', 'bottom']}>
            <FontAwesome name="warning" size={30} color="#ffc107" style={{ marginBottom: 10 }} />
            <Text style={styles.errorText}>Błąd ładowania sald.</Text>
            <Text style={styles.subText}>{error}</Text>
        </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Twój Portfel</Text>
        
        <View style={styles.table}>
            <View style={[styles.row, styles.headerRow]}>
                <Text style={[styles.cell, styles.headerCell, styles.currencyCell]}>Waluta</Text>
                <Text style={[styles.cell, styles.headerCell]}>Saldo</Text>
            </View>

            {balances.length > 0 ? balances.map((balance) => (
                <View key={balance.waluta_skrot} style={styles.row}>
                    <Text style={[styles.cell, styles.currencyCell]}>{balance.waluta_skrot}</Text>
                    <Text style={styles.cell}>{balance.saldo.toFixed(2)}</Text> 
                </View>
            )) : (
                <View style={[styles.row, { justifyContent: 'center' }]}>
                    <Text style={styles.subText}>Brak sald do wyświetlenia.</Text>
                </View>
            )}
        </View>

        <Text style={styles.footerText}>Wszystkie salda są aktualizowane w czasie rzeczywistym.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    scrollContent: { padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 },
    header: { fontSize: 24, fontWeight: '700', marginBottom: 20, color: '#343a40' },
    errorText: { color: '#dc3545', fontSize: 18, fontWeight: '600', marginBottom: 10 },
    subText: { fontSize: 14, color: '#6c757d' },
    loadingText: { marginTop: 10, color: '#007bff' },
    table: { backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', elevation: 3, marginBottom: 20 },
    row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 12 },
    headerRow: { backgroundColor: '#28a745', borderBottomWidth: 0 },
    headerCell: { fontWeight: 'bold', color: '#fff' },
    cell: { flex: 1, textAlign: 'center', fontSize: 16, paddingHorizontal: 5 },
    currencyCell: { flex: 1, textAlign: 'left', paddingLeft: 15, fontWeight: '600' },
    footerText: { fontSize: 12, color: '#6c757d', textAlign: 'center' }
});