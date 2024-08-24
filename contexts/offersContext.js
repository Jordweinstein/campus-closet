import { createContext, useContext, useState, useEffect } from "react";
import { addDoc, getDoc, doc, updateDoc, collection, deleteDoc, onSnapshot, query, where, arrayUnion } from "firebase/firestore";
import { AuthContext } from "./authContext";
import { ListingsContext } from "./listingContext"; // Import ListingsContext
import db from "../firebase/db";

export const OffersContext = createContext();

export const OffersProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const { removeListing } = useContext(ListingsContext); // Access removeListing function
    const [sentOffers, setSentOffers] = useState([]);
    const [activeOffers, setActiveOffers] = useState([]);
    const [inactiveOffers, setInactiveOffers] = useState([]);
    const [inactiveSentOffers, setInactiveSentOffers] = useState([]);
    const [acceptedOffers, setAcceptedOffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const offersRef = collection(db, "offers");

    const offersRef = collection(db, "offers");

    const calculateNumRentalIntervals = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const difference = end - start;
        const days = difference / (1000 * 60 * 60 * 24);
        return Math.ceil(days / 3);
    };

    const sendRentalOffer = async (listing, range) => {
        if (!user) return; // Guard clause
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
            isFinalized: false
        };
        const docRef = await addDoc(collection(db, "offers"), offerData);
        await updateDoc(userDocRef, { offeredListings: arrayUnion(docRef.id) });
    };

    const sendBuyOffer = async (listing) => {
        if (!user) return; 
        const userDocRef = doc(db, "users", user.uid);
        const offerData = {
            isAccepted: false,
            isRejected: false,
            isRental: false,
            listing: listing.id,
            price: (listing.purchaseMethod[1]) ? listing.price[1] : listing.price[0],
            receiver: listing.owner,
            rentalPeriod: null,
            sender: user.uid,
            offerImg: listing.images[0],
            offerItem: listing.itemName,
            isFinalized: false
        };
        const docRef = await addDoc(collection(db, "offers"), offerData);
        await updateDoc(userDocRef, { offeredListings: arrayUnion(docRef.id) });
    };

    const respondOffer = async (offerId, response) => {
        if (!user) return; 
        const offerDocRef = doc(db, "offers", offerId);
        const updateObject = (response.toLowerCase() === "accept") ? { isAccepted: true } : { isRejected: true, receiver: null };
        await updateDoc(offerDocRef, updateObject);
    };

    const finalizeOffer = async (offerId) => {
        if (!user) return; 
        const offerDocRef = doc(db, "offers", offerId);
        const offerSnapshot = await getDoc(offerDocRef);
        if (!offerSnapshot.exists()) return;
        const offerData = offerSnapshot.data();
        if (offerData.isRental) {
            const listingRef = doc(db, "listings", offerData.listing);
            await updateDoc(listingRef, {
                unavailableStartDates: arrayUnion(offerData.rentalPeriod[0]),
                unavailableEndDates: arrayUnion(offerData.rentalPeriod[1]),
            });
        } else {
            // If the offer is not rental, remove the listing
            const listing = {
                id: offerData.listing,
                images: [], // You will need to fetch the images of the listing here or pass them through another way
            };
            await removeListing(listing); // Call removeListing function
        }
        await updateDoc(offerDocRef, { isFinalized: true });
    };

    // Effect to fetch received offers
    useEffect(() => {
        if (!user) return; 
        setLoading(true);
    
        // Query for both active and inactive offers
        const userActiveOffersQuery = query(offersRef, where("receiver", "==", user.uid), where("isFinalized", "==", false));
        const userInactiveOffersQuery = query(offersRef, where("receiver", "==", user.uid), where("isFinalized", "==", true));
    
        // Subscribe to active offers
        const unsubscribeActive = onSnapshot(userActiveOffersQuery, querySnapshot => {
            const offers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setActiveOffers(offers);
            setLoading(false);
        }, error => console.error('Error fetching active offers:', error));
    
        // Subscribe to inactive offers
        const unsubscribeInactive = onSnapshot(userInactiveOffersQuery, querySnapshot => {
            const offers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setInactiveOffers(offers);
        }, error => console.error('Error fetching inactive offers:', error));
    
        // Cleanup function
        return () => {
            unsubscribeActive();
            unsubscribeInactive();
        };
    }, [user]);

    useEffect(() => {
        if (!user) return;
        const userSentOffersQuery = query(offersRef, where("sender", "==", user.uid), where("isFinalized", "==", false));
        const userFinalizedSentOffersQuery = query(offersRef, where("sender", "==", user.uid), where("isFinalized", "==", true));
    
        // Subscribe to sent offers
        const unsubscribeSentOffers = onSnapshot(userSentOffersQuery, querySnapshot => {
            const offers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSentOffers(offers);
            setAcceptedOffers(offers.filter(offer => offer.isAccepted));
        }, error => console.error('Error fetching sent offers:', error));
    
        // Subscribe to finalized sent offers
        const unsubscribeFinalizedSentOffers = onSnapshot(userFinalizedSentOffersQuery, querySnapshot => {
            const offers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setInactiveSentOffers(offers);
        }, error => console.error('Error fetching finalized sent offers:', error));
    
        // Cleanup function
        return () => {
            unsubscribeSentOffers();
            unsubscribeFinalizedSentOffers();
        };
    }, [user]);

    return (
        <OffersContext.Provider
            value={{
                sendRentalOffer, sendBuyOffer, respondOffer, finalizeOffer,
                sentOffers, activeOffers, inactiveOffers, acceptedOffers, inactiveSentOffers, loading
            }}
        >
            {children}
        </OffersContext.Provider>
    );
};
