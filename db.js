import { getFirestore } from "firebase/firestore";
import app from './firebase-config';

const db = getFirestore(app);
export default db;
