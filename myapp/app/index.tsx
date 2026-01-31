import { Redirect } from 'expo-router';
import React from 'react';
import { useSelector } from 'react-redux';
import { View, ActivityIndicator } from 'react-native';
import { RootState } from '../src/store/store';

export default function Index() {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return isAuthenticated ? (
    <Redirect href="/(tabs)/exchange" />
  ) : (
    <Redirect href={"/auth" as any} />
  );
}