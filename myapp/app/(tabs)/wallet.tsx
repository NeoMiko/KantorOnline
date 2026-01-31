import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { RootState, AppDispatch } from '../../src/store/store'; 
import { fetchWalletBalances } from '../../src/services/walletService';
import { logout } from '../../src/store/slices/authSlice';

export default function WalletScreen() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    
    
    const { balances, isLoading, error } = useSelector((state: RootState) => state.wallet);
    const { isAuthenticated, token, userId } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        // Dane pobieramy tylko gdy użytkownik jest zalogowany i mamy komplet kluczy
        if (isAuthenticated && token && userId) {
            dispatch(fetchWalletBalances({ token, userId }));
        }
    }, [isAuthenticated, token, userId]);

    const handleLogout = () => {
        dispatch(logout());
        router.replace('./auth'); 
    };

    // Ekran braku autoryzacji
    if (!isAuthenticated) {
        return (
            <SafeAreaView style={styles.center} edges={['top', 'bottom']}>
                <FontAwesome name="lock" size={50} color="#6c757d" style={{ marginBottom: 15 }} />
                <Text style={styles.errorText}>Wymagana Autoryzacja</Text>
                <Text style={styles.subText}>Zaloguj się, aby zobaczyć swoje salda.</Text>
                <TouchableOpacity 
                    style={[styles.button, { marginTop: 20, backgroundColor: '#007bff' }]}
                    onPress={() => router.push('./auth')}
                >
                    <Text style={styles.buttonText}>Przejdź do logowania</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // Ekran ładowania
    if (isLoading) {
        return (
            <SafeAreaView style={styles.center} edges={['top', 'bottom']}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.loadingText}>Pobieranie Twoich sald...</Text>
            </SafeAreaView>
        );
    }

    // Widok główny z saldami
    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerContainer}>
                    <Text style={styles.header}>Twój Portfel</Text>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
                        <FontAwesome name="sign-out" size={24} color="#dc3545" />
                    </TouchableOpacity>
                </View>
                
                <View style={styles.table}>
                    <View style={[styles.row, styles.headerRow]}>
                        <Text style={[styles.cell, styles.headerCell, styles.currencyCell]}>Waluta</Text>
                        <Text style={[styles.cell, styles.headerCell]}>Saldo</Text>
                    </View>

                    {balances && balances.length > 0 ? (
                        balances.map((balance) => (
                            <View key={balance.waluta_skrot} style={styles.row}>
                                <View style={styles.currencyInfo}>
                                    <Text style={[styles.cell, styles.currencyCell]}>{balance.waluta_skrot}</Text>
                                </View>
                                <Text style={styles.cell}>{balance.saldo.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text> 
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyRow}>
                            <Text style={styles.subText}>Brak środków na koncie.</Text>
                        </View>
                    )}
                </View>

                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorTextSmall}>Błąd aktualizacji: {error}</Text>
                    </View>
                )}

                <TouchableOpacity 
                    style={styles.refreshButton} 
                    onPress={() => {
                      if (token && userId) {
                        dispatch(fetchWalletBalances({ 
                          token: token as string, 
                          userId: userId as string 
                        }));
                      }
                    }}
                >
                    <FontAwesome name="refresh" size={16} color="#fff" />
                    <Text style={styles.refreshButtonText}> Odśwież salda</Text>
                </TouchableOpacity>

                <Text style={styles.footerText}>Salda są powiązane z Twoim kontem użytkownika.</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    scrollContent: { padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa', padding: 20 },
    headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    header: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' },
    logoutIcon: { padding: 5 },
    errorText: { color: '#343a40', fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
    errorTextSmall: { color: '#dc3545', textAlign: 'center', fontSize: 12 },
    errorContainer: { marginBottom: 15, padding: 10, backgroundColor: '#f8d7da', borderRadius: 8 },
    subText: { fontSize: 15, color: '#6c757d', textAlign: 'center' },
    loadingText: { marginTop: 15, fontSize: 16, color: '#007bff' },
    table: { backgroundColor: '#fff', borderRadius: 15, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, marginBottom: 20 },
    row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f1f1', paddingVertical: 15 },
    headerRow: { backgroundColor: '#28a745', borderBottomWidth: 0 },
    headerCell: { fontWeight: 'bold', color: '#fff', fontSize: 16 },
    cell: { flex: 1, textAlign: 'center', fontSize: 17, color: '#333' },
    currencyCell: { textAlign: 'left', paddingLeft: 20, fontWeight: 'bold', color: '#28a745' },
    currencyInfo: { flex: 1 },
    emptyRow: { padding: 30, alignItems: 'center' },
    button: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: 10 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    refreshButton: { backgroundColor: '#007bff', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 10, marginBottom: 15 },
    refreshButtonText: { color: '#fff', fontWeight: 'bold' },
    footerText: { fontSize: 12, color: '#adb5bd', textAlign: 'center', marginTop: 10 }
});