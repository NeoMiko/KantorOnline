import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function WalletScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Portfel Użytkownika</Text>
        <Text style={styles.text}>Tutaj wyświetlimy aktualne salda walut.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007bff',
  },
  text: {
    fontSize: 16,
    color: '#343a40',
  },
});