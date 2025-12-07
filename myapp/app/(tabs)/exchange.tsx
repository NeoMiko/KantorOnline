import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../src/store/store'; 
import { Rate } from '../../src/store/slices/ratesSlice';

export default function ExchangeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  
  // Pobieramy dane z Reduxa
  const { rates, isLoading, error, lastUpdated } = useSelector((state: RootState) => state.rates);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
        console.log("Użytkownik nie jest uwierzytelniony.");
    }
  }, [isAuthenticated]);



  if (!isAuthenticated) {
    return (
        <SafeAreaView style={styles.center}>
            <Text style={styles.errorText}>Wymagana Autoryzacja.</Text>
            <Text style={styles.subText}>Zaloguj się, aby zobaczyć aktualne kursy.</Text>
        </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
        <SafeAreaView style={styles.center}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Pobieranie kursów...</Text>
        </SafeAreaView>
    );
  }

  if (error) {
    return (
        <SafeAreaView style={styles.center}>
            <Text style={styles.errorText}>Błąd ładowania: {error}</Text>
        </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Aktualne Kursy Wymiany (PLN)</Text>
        
        <Text style={styles.updatedText}>
            Ostatnia aktualizacja: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Brak danych'}
        </Text>
        

        <View style={styles.table}>
            <View style={[styles.row, styles.headerRow]}>
                <Text style={[styles.cell, styles.headerCell, styles.currencyCell]}>Waluta</Text>
                <Text style={[styles.cell, styles.headerCell]}>Kupno (Bank)</Text>
                <Text style={[styles.cell, styles.headerCell]}>Sprzedaż (Bank)</Text>
            </View>

            {rates.map((rate: Rate) => (
                <View key={rate.waluta_skrot} style={styles.row}>
                    <Text style={[styles.cell, styles.currencyCell]}>{rate.waluta_skrot}</Text>
                    <Text style={styles.cell}>{rate.kurs_kupna.toFixed(4)}</Text>
                    <Text style={styles.cell}>{rate.kurs_sprzedazy.toFixed(4)}</Text>
                </View>
            ))}
        </View>


        <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Formularz Transakcji</Text>
            <Text style={styles.text}>Tutaj znajdzie się formularz KUPNO/SPRZEDAŻ.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    scrollContent: { padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 },
    header: { fontSize: 24, fontWeight: '700', marginBottom: 5, color: '#343a40' },
    updatedText: { fontSize: 14, color: '#6c757d', marginBottom: 20 },
    errorText: { color: 'red', fontSize: 18, marginBottom: 10 },
    subText: { fontSize: 14, color: '#6c757d' },
    loadingText: { marginTop: 10, color: '#007bff' },

    // Stylizacja Tabeli
    table: { backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', elevation: 3, marginBottom: 30 },
    row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 12 },
    headerRow: { backgroundColor: '#007bff', borderBottomWidth: 0 },
    headerCell: { fontWeight: 'bold', color: '#fff' },
    cell: { flex: 1, textAlign: 'center', fontSize: 15, paddingHorizontal: 5 },
    currencyCell: { flex: 0.8, textAlign: 'left', paddingLeft: 15, fontWeight: '600' },

    // Stylizacja Sekcji Formularza
    formSection: { marginTop: 10, backgroundColor: '#e9ecef', borderRadius: 8, padding: 15, elevation: 1 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#343a40' },
    text: { color: '#495057' }
});