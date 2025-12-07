import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store/store'; 

export default function WalletScreen() {
  
  const { balances } = useSelector((state: RootState) => state.wallet);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Portfel Użytkownika</Text>
      <ScrollView style={styles.listContainer}>
        {balances.map((balance) => (
          <View key={balance.waluta_skrot} style={styles.balanceItem}>
            <Text style={styles.currency}>{balance.waluta_skrot}</Text>
            <Text style={styles.saldo}>{balance.saldo.toFixed(2)}</Text>
          </View>
        ))}
        {balances.length === 0 && (
          <Text style={styles.noData}>Brak dostępnych sald.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    color: '#343a40',
  },
  listContainer: {
    flex: 1,
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  currency: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  saldo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
  },
  noData: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#6c757d',
  },
});