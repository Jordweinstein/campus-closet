import db from "../firebase/db";
import { addDoc, getDoc, doc, updateDoc, collection, onSnapshot, query, where, arrayUnion } from "firebase/firestore"; 
import { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./authContext";

export const OffersContext = createContext();

export const OffersProvider = ({ children }) => {

    const offersRef = collection(db, "offers");
    const { user } = useContext(AuthContext);
    const userDocRef = doc(db, "users", user.uid)
    const [receivedOffers, setReceievedOffers] = useState([]);
    const [sentOffers, setSentOffers] = useState([]);
    // finalizedSentOffers
    // finalizedReceivedOffers
    const [acceptedListings, setAcceptedListings] = useState([]); 
    const [loading, setLoading] = useState(false);

    // sendOffer
    const sendRentalOffer = async (listing, range) => {
        const docRef = await addDoc(offersRef, {
            isAccepted: false,
            listing: listing.id,
            price: listing.price[0],
            receiver: listing.owner,
            rentalPeriod: range,
            sender: user.uid,
            offerImg: listing.images[0],
            offerItem: listing.itemName,
            isFinalized: false
        }); 
        try {
            await updateDoc(userDocRef, {offeredListings: arrayUnion(docRef.id)})   
        } catch (error) {
            console.log("Error adding offerId to user document: " + error);
        }
    }

    const sendBuyOffer = async(listing) => {
        await addDoc(offersRef, {
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
        });
        try {
            await updateDoc(userDocRef, {offeredListings: arrayUnion(docRef.id)})   
        } catch (error) {
            console.log("Error adding offerId to user document: " + error);
        }
    }

    // respondOffer
    const respondOffer = async (offer, response) => {
        try {
            const docRef = doc(db, "offers", offer);

            const docSnapshot = await getDoc(docRef);
            if (!docSnapshot.exists()) {
                console.error("No document found with ID:", offer);
                return;
            }

            console.log("response" + response);
            const updateObject = (response.toLowerCase() === "accept") ? { isAccepted: true, receiver: null } : { isRejected: true, receiver: null };

            await updateDoc(docRef, updateObject);  
        } catch (error) {
            console.error("error updating doc:", error);
        }
    }

    // retrieve a user's received offers
    useEffect(() => {
        if (!user) {
            return;
        }

        setLoading(true);
        const userOffersQuery = query(offersRef, where("receiver", "==", user.uid));
        
        const unsubscribe = onSnapshot(
            userOffersQuery,
            (querySnapshot) => {
                const data = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setReceievedOffers(data);
                setLoading(false);
            },
            (error) => {
                console.error('error fetching user offers: ' + error);
            }
        );

        return () => {
            unsubscribe();
        };
    })

    // retrieve a user's sent offers
    useEffect(() => {
        if (!user) {
            console.log("No user found");
            return;
        }
    
        const userOffersQuery = query(offersRef, where("sender", "==", user.uid));
        
        const unsubscribe = onSnapshot(
            userOffersQuery,
            (querySnapshot) => {
                const data = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setSentOffers(data);
    
                const acceptedListings = data
                    .filter(offer => offer.isAccepted)
                    .map(offer => offer.listing);
                setAcceptedListings(acceptedListings);
            },
            (error) => {
                console.error('Error fetching user offers: ', error);
            }
        );
    
        return () => {
            unsubscribe();
        };
    }, [user]);
    return (
      <OffersContext.Provider
        value={{ sendRentalOffer, sendBuyOffer, respondOffer, receivedOffers, sentOffers, acceptedListings, loading }}
      >
        {children}
      </OffersContext.Provider>
    );
  };