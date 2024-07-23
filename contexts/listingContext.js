import React, { createContext, useState, useEffect, useContext } from "react";
import { collection, query, where, orderBy, limit, onSnapshot, startAfter, getDocs } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import db from "../firebase/db";
import { AuthContext } from "./authContext";

export const ListingsContext = createContext();

export const ListingsProvider = ({ children }) => {
  const [listings, setListings] = useState([]);
  const [userListings, setUserListings] = useState([]);
  const [trendingListings, setTrendingListings] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const listingsRef = collection(db, "listings");

  const fetchData = (queryKey, setData, queryRef) => {
    const unsubscribe = onSnapshot(
      queryRef,
      (querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(data);
      },
      (error) => {
        console.error(`Error fetching ${queryKey} data:`, error);
      }
    );

    return () => {
      unsubscribe();
    };
  };

  useEffect(() => {
    if (!user) return;

    const fetchPaginatedData = async () => {
      setLoading(true);
      let paginatedQuery;
      if (lastDoc) {
        paginatedQuery = query(listingsRef, orderBy("timestamp", "desc"), startAfter(lastDoc), limit(10));
      } else {
        paginatedQuery = query(listingsRef, orderBy("timestamp", "desc"), limit(10));
      }

      const querySnapshot = await getDocs(paginatedQuery);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setListings((prevData) => [...prevData, ...data]);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setLoading(false);
    };

    fetchPaginatedData();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUserListings([]);
      return;
    }
    const userQuery = query(listingsRef, where("owner", "==", user.uid));
    fetchData(`userListingsCache_${user.uid}`, setUserListings, userQuery);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const trendingQuery = query(listingsRef, orderBy("likes", "desc"), limit(10));
    fetchData("trendingListingsCache", setTrendingListings, trendingQuery);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const recentQuery = query(listingsRef, orderBy("timestamp", "desc"), limit(10));
    fetchData("recentListingsCache", setRecentListings, recentQuery);
  }, [user]);

  const removeListing = async (listing) => {
    // deleting images from storage
    setLoading(true);
    const storage = getStorage();
    const promises = listing.images.map(async (url) => {
        const decodedUrl = decodeURIComponent(url);
        const startIndex = decodedUrl.indexOf("/o/") + 3;
        const endIndex = decodedUrl.indexOf("?alt=");
        const filePath = decodedUrl.substring(startIndex, endIndex);
    
        const imageRef = ref(storage, filePath);
        await deleteObject(imageRef).then(() => {
            console.log(filePath + " image deleted successfully");
        }).catch((error) => {
            console.log(error);
        })
      });
    
      // deleting document from firestore
      try {
        await Promise.all(promises);
        console.log("All files deleted successfully");

        await removeListingReferenceFromUser(listing.id);
        
        await deleteDoc(doc(db, "listings", listing.id));

        navigation.goBack();
        alert("Listing successfully deleted.");
      } catch (error) {
        console.error("Error deleting files:", error);
      } finally {
        setLoading(false);
      }
    
  }

  return (
    <ListingsContext.Provider
      value={{ listings, removeListing, userListings, trendingListings, recentListings, setLastDoc, setLoading, loading }}
    >
      {children}
    </ListingsContext.Provider>
  );
};