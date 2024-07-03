import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import db from "../db";

export default function useUserDoc(userId) {
  const [document, setDocument] = useState(null);

  useEffect(
    () => {
      if (!userId) {
        setDocument(null);
        return;
      }

      const docRef = doc(db, "users", userId);

      const unsubscribe = onSnapshot(
        docRef,
        docSnap => {
          if (docSnap.exists()) {
            setDocument({ id: docSnap.id, ...docSnap.data() });
          } else {
            setDocument(null);
          }
        },
        error => {
          console.log("Error fetching document: ", error);
          setDocument(null);
        }
      );

      return () => unsubscribe();
    },
    [userId]
  );

  return { document };
}
