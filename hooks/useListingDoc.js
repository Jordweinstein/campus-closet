import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import db from "../db";

export default function useListingDoc(listingId) {
  const [document, setDocument] = useState(null);

  useEffect(
    () => {
      if (!listingId) {
        setDocument(null);
        return;
      }

      const docRef = doc(db, "listings", listingId);

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
          setDocument(null);
        }
      );

      return () => unsubscribe();
    },
    [listingId]
  );

  return { document };
}
