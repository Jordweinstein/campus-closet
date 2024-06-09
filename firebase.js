import { initializeApp, getApps } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyDqFWJ2Jed34nivpv3ZOil3ZSuHBm_SoFg",
    authDomain: "rent-the-campus.firebaseapp.com",
    projectId: "rent-the-campus",
    storageBucket: "rent-the-campus.appspot.com",
    messagingSenderId: "52589543033",
    appId: "1:52589543033:web:cf7272d9e3625e6f905ea8"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

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