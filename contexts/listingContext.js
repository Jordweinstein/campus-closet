import React, { createContext, useState, useEffect, useContext } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  getDocs,
  query,
  where
} from "@firebase/firestore";
import db from "../firebase/db";
import { AuthContext } from "./authContext";

export const ListingsContext = createContext();

export const ListingsProvider = ({ children }) => {
  const [listings, setListings] = useState([]);
  const [userListings, setUserListings] = useState([]);
  const [trendingListings, setTrendingListings] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const { user } = useContext(AuthContext);
  const listingsRef = collection(db, "listings");

  // fetch all listings
  useEffect(
    () => {
      if (!user) {
        return;
      }

      const unsubscribe = onSnapshot(
        collection(db, "listings"),
        querySnapshot => {
          const listingsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setListings(listingsData);
        },
        error => {
          console.error("Error fetching listings data:", error);
        }
      );

      return () => {
        unsubscribe();
      };
    },
    [user]
  );

  // fetch user's listings
  useEffect(
    () => {
      let unsubscribe;

      if (user) {
        const q = query(listingsRef, where("owner", "==", user.uid));

        unsubscribe = onSnapshot(
          q,
          querySnapshot => {
            const listingsData = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setUserListings(listingsData);
          },
          error => {
            console.error("Error fetching user listings", error);
          }
        );
      } else {
        setUserListings([]);
      }

      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    },
    [user]
  );

  // Fetch trending listings based on like count
  useEffect(() => {
    let unsubscribe;

    const q = query(listingsRef, orderBy("likes", "desc"), limit(10));

    unsubscribe = onSnapshot(
      q,
      querySnapshot => {
        const trendingListingsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTrendingListings(trendingListingsData);
      },
      error => {
        console.error("Error fetching trending listings", error);
      }
    );

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Fetch recent listings based on timestamp of upload
  useEffect(() => {
    let unsubscribe;

    const q = query(listingsRef, orderBy("timestamp", "desc"), limit(10));

    unsubscribe = onSnapshot(
      q,
      querySnapshot => {
        const recentListingsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecentListings(recentListingsData);
      },
      error => {
        console.error("Error fetching recent listings", error);
      }
    );

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <ListingsContext.Provider
      value={{ listings, userListings, trendingListings, recentListings }}
    >
      {children}
    </ListingsContext.Provider>
  );
};

//   const handleDelete = async listing => {
//     // Deleting images from storage
//     const storage = getStorage();
//     const promises = listing.images.map(async url => {
//       const decodedUrl = decodeURIComponent(url);
//       const startIndex = decodedUrl.indexOf("/o/") + 3;
//       const endIndex = decodedUrl.indexOf("?alt=");
//       const filePath = decodedUrl.substring(startIndex, endIndex);

//       const imageRef = ref(storage, filePath);
//       await deleteObject(imageRef)
//         .then(() => {
//           console.log(filePath + " image deleted successfully");
//         })
//         .catch(error => {
//           console.log(error);
//         });
//     });

//     // Deleting document from Firestore
//     try {
//       await Promise.all(promises);
//       console.log("All files deleted successfully");
//     } catch (error) {
//       console.error("Error deleting files:", error);
//     }

//     try {
//       await deleteDoc(doc(db, "listings", listing.id));
//       console.log(`Listing ${listing.id} successfully deleted.`);
//     } catch (error) {
//       console.error("Error deleting listing:", error);
//     }
//   };

// change this to make it inactive
//   useEffect(
//     () => {
//       const checkForExpiredRentals = async () => {
//         const now = new Date();
//         listings.forEach(async listing => {
//           if (listing.purchaseMethod.includes("Rent")) {
//             const rentalEndDate = new Date(listing.datesAvailable[1]); // Adjust based on your data structure
//             if (rentalEndDate < now) {
//               await handleDelete(listing);
//             }
//           }
//         });
//       };

//       // Run check once a day
//       const interval = setInterval(checkForExpiredRentals, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
//       checkForExpiredRentals();

//       return () => clearInterval(interval);

//     },
//     [listings]
//   );
