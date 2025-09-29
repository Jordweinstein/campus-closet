import { createContext, useContext, useState, useEffect } from "react";
import { addDoc, getDoc, doc, updateDoc, collection, deleteDoc, getDocs, onSnapshot, query, where, arrayUnion, arrayRemove } from "firebase/firestore";
import { AuthContext } from "./authContext";
import db from "../firebase/db";

export const OffersContext = createContext();

export const OffersProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [sentOffers, setSentOffers] = useState([]);
    const [activeOffers, setActiveOffers] = useState([]);
    const [inactiveOffers, setInactiveOffers] = useState([]);
    const [inactiveSentOffers, setInactiveSentOffers] = useState([]);
    const [acceptedOffers, setAcceptedOffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const offersRef = collection(db, "offers");

    const calculateNumRentalIntervals = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const difference = end - start;
        const days = difference / (1000 * 60 * 60 * 24);
        return Math.ceil(days / 3);
    };

    const sendRentalOffer = async (listing, range) => {
        if (!user) return;
        try {
          const userDocRef = doc(db, "users", user.uid);
          const price = calculateNumRentalIntervals(range[0], range[1]) * listing.price[0];
          const offerData = {
            isAccepted: false,
            listing: listing.id,
            isRental: true,
            price: price,
            receiver: listing.owner,
            rentalPeriod: range,
            sender: user.uid,
            offerImg: listing.images[0],
            offerItem: listing.itemName,
            isFinalized: false,
          };
          const docRef = await addDoc(collection(db, "offers"), offerData);
          await updateDoc(userDocRef, { offeredListings: arrayUnion(docRef.id) });
        } catch (error) {
          console.error("Error sending rental offer:", error);
        }
      };

    const sendBuyOffer = async (listing) => {
    if (!user) return;
    try {
        const userDocRef = doc(db, "users", user.uid);
        const offerData = {
        isAccepted: false,
        isRejected: false,
        isRental: false,
        listing: listing.id,
        price: listing.purchaseMethod[1] ? listing.price[1] : listing.price[0],
        receiver: listing.owner,
        rentalPeriod: null,
        sender: user.uid,
        offerImg: listing.images[0],
        offerItem: listing.itemName,
        isFinalized: false,
        };
        const docRef = await addDoc(collection(db, "offers"), offerData);
        await updateDoc(userDocRef, { offeredListings: arrayUnion(docRef.id) });
    } catch (error) {
        console.error("Error sending buy offer:", error);
    }
    };
    
    // Respond to offer with error logging
    const respondOffer = async (offerId, response) => {
    if (!user) return;
    try {
        const offerDocRef = doc(db, "offers", offerId);
        const userDocRef = doc(db, "users", user.uid);
    
        const updateObject = response.toLowerCase() === "accept" ? { isAccepted: true } : { isRejected: true, receiver: null };
        if (response.toLowerCase() !== "accept") {
        await updateDoc(userDocRef, { offeredListings: arrayRemove(offerId) });
        await deleteDoc(offerDocRef);
        }
        await updateDoc(offerDocRef, updateObject);
    } catch (error) {
        console.error("Error responding to offer:", error);
    }
    };
    
    // Finalize offer with error logging
    const finalizeOffer = async (offerId) => {
      console.log(offerId);
      if (!user) return;
      try {
        const offerDocRef = doc(db, "offers", offerId);
        const offerSnapshot = await getDoc(offerDocRef);
        if (!offerSnapshot.exists()) {
          return
        };
        const offerData = offerSnapshot.data();
        const listingRef = doc(db, "listings", offerData.listing);
        if (offerData.isRental) {
            await updateDoc(listingRef, {
              unavailableStartDates: arrayUnion(offerData.rentalPeriod[0]),
              unavailableEndDates: arrayUnion(offerData.rentalPeriod[1]),
            });
          } else {
            await updateDoc(listingRef, {
              isAvailable: false,
            });
          }
          await updateDoc(offerDocRef, { isFinalized: true });
      } catch (error) {
          console.error("Error finalizing offer:", error);
      }
    };

    // retrieve the authenticated user's offer object based on the listingID
    const getOfferByListingId = async (listingId) => {
      if (!user || !listingId) return;
      setLoading(true);
  
      const offerQuery = query(offersRef, 
        where("listing", "==", listingId),
        where("sender", "==", user.uid),
      );
  
      try {
        const querySnapshot = await getDocs(offerQuery);
        if (!querySnapshot.empty) {
          const offerDoc = querySnapshot.docs[0]; 
          const offerData = offerDoc.data(); 
          offerData.id = offerDoc.id; 
          console.log(offerData);
          setLoading(false);
          return offerData; 
      } else {
            setLoading(false);
            return null;  
        }
      } catch (error) {
        console.error('Error fetching offer by listing ID:', error);
        setLoading(false);
        return null;
      }
    };

    // Effect to fetch received offers with error logging
    useEffect(() => {
        if (!user) return;
        setLoading(true);
  
        const userActiveOffersQuery = query(offersRef, where("receiver", "==", user.uid), where("isFinalized", "==", false));
        const userInactiveOffersQuery = query(offersRef, where("receiver", "==", user.uid), where("isFinalized", "==", true));
  
        const unsubscribeActive = onSnapshot(userActiveOffersQuery, querySnapshot => {
            const offers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setActiveOffers(offers);
            setLoading(false);
        }, error => {
            console.error('Error fetching active offers:', error);
        });
  
        const unsubscribeInactive = onSnapshot(userInactiveOffersQuery, querySnapshot => {
        const offers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInactiveOffers(offers);
        }, error => {
        console.error('Error fetching inactive offers:', error);
        });
  
        return () => {
        unsubscribeActive();
        unsubscribeInactive();
        };
  }, [user]);
  
  // Effect to fetch sent offers with error logging
  useEffect(() => {
    if (!user) return;
  
    const userSentOffersQuery = query(offersRef, where("sender", "==", user.uid), where("isFinalized", "==", false));
    const userFinalizedSentOffersQuery = query(offersRef, where("sender", "==", user.uid), where("isFinalized", "==", true));
  
    const unsubscribeSentOffers = onSnapshot(userSentOffersQuery, querySnapshot => {
      const offers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSentOffers(offers);
      setAcceptedOffers(offers.filter(offer => offer.isAccepted));
    }, error => {
      console.error('Error fetching sent offers:', error);
    });
  
    const unsubscribeFinalizedSentOffers = onSnapshot(userFinalizedSentOffersQuery, querySnapshot => {
      const offers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInactiveSentOffers(offers);
    }, error => {
      console.error('Error fetching finalized sent offers:', error);
    });
  
    return () => {
      unsubscribeSentOffers();
      unsubscribeFinalizedSentOffers();
    };
  }, [user]);

    return (
        <OffersContext.Provider
            value={{
                sendRentalOffer, sendBuyOffer, respondOffer, finalizeOffer, getOfferByListingId,
                sentOffers, activeOffers, inactiveOffers, acceptedOffers, inactiveSentOffers, loading
            }}
        >
            {children}
        </OffersContext.Provider>
    );
};
