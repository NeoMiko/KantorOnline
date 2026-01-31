import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SectionList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesome } from '@expo/vector-icons';
import { RootState, AppDispatch } from '../../src/store/store'; 
import { Order } from '../../src/store/slices/ordersSlice'; 
import { SafeAreaView } from 'react-native-safe-area-context';


interface OrderSection {
    title: string;
    data: Order[];
}

export default function OrdersScreen() {
    const dispatch = useDispatch<AppDispatch>();
    
   
    const { pendingOrders, history, isLoading, error } = useSelector((state: RootState) => state.orders);
    

    const sections: OrderSection[] = [
        { title: 'Zlecenia Oczekujące', data: pendingOrders },
        { title: 'Historia Zleceń', data: history },
    ];

   
    const OrderItem = ({ order }: { order: Order }) => {
        const isPending = order.status === 'OCZEKUJACE';
        const actionType = order.typ === 'KUPNO' ? 'Kupuje' : 'Sprzedaje';

        return (
            <View style={styles.orderItem}>
                <View style={styles.details}>
                    <Text style={styles.currency}>{order.waluta_skrot} ({actionType})</Text>
                    
                    <Text style={styles.dataText}>
                        <Text style={styles.label}>Kwota: </Text>{order.kwota.toFixed(2)}
                    </Text>
                    
                    <Text style={styles.dataText}>
                        <Text style={styles.label}>Kurs Docelowy: </Text>{order.kurs_docelowy.toFixed(4)} PLN
                    </Text>
                    
                    <Text style={styles.dataText}>
                        <Text style={styles.label}>Utworzono: </Text>{new Date(order.data_utworzenia).toLocaleDateString()}
                    </Text>
                </View>
                
                <View style={styles.statusContainer}>
                    <Text style={[styles.statusBadge, isPending ? styles.pending : styles.completed]}>
                        {isPending ? 'OCZEKUJĄCE' : order.status}
                    </Text>
                    
                    {isPending && (
                        <TouchableOpacity 
                            style={styles.cancelButton}
                            onPress={() => console.log('Anulowanie zlecenia: ' + order.id)}
                        >
                            <FontAwesome name="times-circle" size={24} color="#dc3545" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

  
    
    if (error) {
        return <View style={styles.center}><Text style={styles.errorText}>Błąd: {error}</Text></View>;
    }

    if (isLoading) {
        return <View style={styles.center}><Text style={styles.loadingText}>Ładowanie zleceń...</Text></View>;
    }


    return (
        <SafeAreaView style={styles.container}>
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <OrderItem order={item} />}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={styles.sectionHeader}>{title}</Text>
                )}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    listContent: { paddingHorizontal: 15, paddingBottom: 20 },
    
    sectionHeader: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        backgroundColor: '#f8f9fa', 
        paddingTop: 20, 
        paddingBottom: 10,
        color: '#343a40' 
    },

   
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginVertical: 5,
        elevation: 2,
    },
    details: {
        flex: 1,
    },
    currency: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#007bff',
    },
    dataText: {
        fontSize: 14,
        color: '#495057',
    },
    label: {
        fontWeight: '600',
        color: '#6c757d',
    },
    

    statusContainer: {
        alignItems: 'flex-end',
    },
    statusBadge: {
        fontSize: 12,
        fontWeight: 'bold',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        marginBottom: 5,
    },
    pending: {
        backgroundColor: '#ffc10730', 
        color: '#ffc107',
    },
    completed: {
        backgroundColor: '#28a74530', 
        color: '#28a745',
    },
    cancelButton: {
        padding: 5,
        marginTop: 5,
    },
    errorText: { color: 'red', fontSize: 18 },
    loadingText: { fontSize: 18, color: '#007bff' }
});