import { Redirect } from 'expo-router';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store/store';

export default function Index() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  return <Redirect href="/exchange" />;
}