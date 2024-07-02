import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import app from './firebase-config';

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  if (error.code !== 'auth/already-initialized') {
    throw error;
  }
  auth = getAuth(app); 
}

export default auth;
