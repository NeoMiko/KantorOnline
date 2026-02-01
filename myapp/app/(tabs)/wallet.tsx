import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { FontAwesome } from '@expo/vector-icons';

import { RootState, AppDispatch } from '../../src/store/store'; 
import { fetchWalletBalances } from '../../src/services/walletService';
import { logout } from '../../src/store/slices/authSlice';

export default function WalletScreen() {
  const dispatch = useDispatch<AppDispatch>();
  
  const { balances, isLoading, error } = useSelector((state: RootState) => state.wallet);
  const { isAuthenticated, userId } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
        dispatch(fetchWalletBalances());
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    dispatch(logout());
  };

  if (!isAuthenticated) {
    return (
        <SafeAreaView style={styles.center} edges={['top', 'bottom']}>
            <FontAwesome name="lock" size={40} color="#dc3545" style={{ marginBottom: 10 }} />
            <Text style={styles.errorText}>Wymagana Autoryzacja.</Text>
            <Text style={styles.subText}>Zaloguj się, aby zobaczyć swoje salda.</Text>
        </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Twój Portfel</Text>

        {isLoading ? (
            <ActivityIndicator size="large" color="#28a745" />
        ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
        ) : (
            <View style={styles.table}>
                <View style={[styles.row, styles.headerRow]}>
                    <Text style={[styles.cell, styles.headerCell]}>Waluta</Text>
                    <Text style={[styles.cell, styles.headerCell]}>Saldo</Text>
                </View>
                {balances.map((item) => (
                    <View key={item.waluta_skrot} style={styles.row}>
                        <Text style={[styles.cell, styles.bold]}>{item.waluta_skrot}</Text>
                        <Text style={styles.cell}>{item.saldo.toFixed(2)}</Text>
                    </View>
                ))}
            </View>
        )}

        <View style={styles.userSection}>
          <Text style={styles.infoText}>Zalogowany jako ID: {userId}</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <FontAwesome name="sign-out" size={18} color="#fff" />
            <Text style={styles.logoutText}>WYLOGUJ SIĘ</Text>
          </TouchableOpacity>
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
    errorText: { color: '#dc3545', fontSize: 16, textAlign: 'center' },
    subText: { fontSize: 14, color: '#6c757d' },
    table: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', elevation: 3, marginBottom: 25 },
    row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 15 },
    headerRow: { backgroundColor: '#28a745' },
    headerCell: { color: '#fff', fontWeight: 'bold' },
    cell: { flex: 1, textAlign: 'center', fontSize: 16 },
    bold: { fontWeight: 'bold' },
    userSection: { marginTop: 10, padding: 15, backgroundColor: '#fff', borderRadius: 12, elevation: 2, alignItems: 'center' },
    infoText: { color: '#666', marginBottom: 15 },
    logoutBtn: { backgroundColor: '#dc3545', flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8, alignItems: 'center' },
    logoutText: { color: '#fff', fontWeight: 'bold', marginLeft: 10 },
    footerText: { textAlign: 'center', marginTop: 30, color: '#999', fontSize: 12 }
});