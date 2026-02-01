import { Tabs } from 'expo-router';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons'; 

export default function TabLayout() {
  const primaryColor = '#007bff'; 

  return (
    <Tabs screenOptions={{ 
        tabBarActiveTintColor: primaryColor, 
        headerShown: false, 
    }}>

      <Tabs.Screen
        name="exchange"
        options={{
          title: 'Wymiana',
          tabBarIcon: ({ color }) => <FontAwesome name="exchange" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Portfel',
          tabBarIcon: ({ color }) => <FontAwesome name="money" size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historia',
          tabBarIcon: ({ color }) => <FontAwesome name="list-alt" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}