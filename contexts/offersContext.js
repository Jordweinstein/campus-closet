import { createContext, useContext, useState, useEffect } from "react";
import { addDoc, getDoc, doc, updateDoc, collection, onSnapshot, query, where, arrayUnion } from "firebase/firestore";
import { AuthContext } from "./authContext";
import db from "../firebase/db";

export const OffersContext = createContext();

export const OffersProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const userDocRef = doc(db, "users", user.uid);
    const offersRef = collection(db, "offers");
    const [sentOffers, setSentOffers] = useState([]);
    const [activeOffers, setActiveOffers] = useState([]);
    const [acceptedOffers, setAcceptedOffers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Function to send rental offer
    const sendRentalOffer = async (listing, range) => {
        const offerData = {
            isAccepted: false,
            listing: listing.id,
            isRental: true,
            price: listing.price[0],
            receiver: listing.owner,
            rentalPeriod: range,
            sender: user.uid,
            offerImg: listing.images[0],
            offerItem: listing.itemName,
            isFinalized: false
        };
        const docRef = await addDoc(offersRef, offerData);
        await updateDoc(userDocRef, {offeredListings: arrayUnion(docRef.id)});
    };

    // Function to send buy offer
    const sendBuyOffer = async (listing) => {
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
        const docRef = await addDoc(offersRef, offerData);
        await updateDoc(userDocRef, {offeredListings: arrayUnion(docRef.id)});
    };

    // Function to respond to offers
    const respondOffer = async (offerId, response) => {
        const offerDocRef = doc(db, "offers", offerId);
        const updateObject = (response.toLowerCase() === "accept") ? { isAccepted: true } : { isRejected: true, receiver: null };
        await updateDoc(offerDocRef, updateObject);
    };

    // Function to finalize offers
    const finalizeOffer = async (offerId) => {
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
        }
        await updateDoc(offerDocRef, { isFinalized: true });
    };

    // Effect to fetch received offers
    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const userOffersQuery = query(offersRef, where("receiver", "==", user.uid), where("isFinalized", "==", false));
        const unsubscribe = onSnapshot(userOffersQuery, querySnapshot => {
            const offers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setActiveOffers(offers);
            setLoading(false);
        }, error => console.error('Error fetching received offers:', error));
        return () => unsubscribe();
    }, [user]);

    // Effect to fetch sent offers
    useEffect(() => {
        if (!user) return;
        const userOffersQuery = query(offersRef, where("sender", "==", user.uid));
        const unsubscribe = onSnapshot(userOffersQuery, querySnapshot => {
            const offers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSentOffers(offers);
            setAcceptedOffers(offers.filter(offer => offer.isAccepted));
        }, error => console.error('Error fetching sent offers:', error));
        return () => unsubscribe();
    }, [user]);

    return (
        <OffersContext.Provider
            value={{
                sendRentalOffer, sendBuyOffer, respondOffer, finalizeOffer,
                sentOffers, activeOffers, acceptedOffers, loading
            }}
        >
            {children}
        </OffersContext.Provider>
    );
};
