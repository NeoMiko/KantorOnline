import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from '../src/store/store';
import { loadAuthData } from '../src/store/slices/authSlice'; 
import { AppDispatch } from '../src/store/store';

function RootLayoutNav() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(loadAuthData());
  }, [dispatch]);

  return (
    <Stack>
   
      <Stack.Screen name="index" options={{ headerShown: false }} />
      
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
    
      <Stack.Screen name="auth" options={{ 
        headerShown: false,
        animation: 'fade' 
      }} />
      
     
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>
  );
}