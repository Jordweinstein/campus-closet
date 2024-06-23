import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCJ-kB644gPcFjibsb_jGYx8trkmKss6ig",
  authDomain: "campus-closet-d43c9.firebaseapp.com",
  projectId: "campus-closet-d43c9",
  storageBucket: "campus-closet-d43c9.appspot.com",
  messagingSenderId: "289095299303",
  appId: "1:289095299303:web:62568c60b343cb68f73242"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export default app;