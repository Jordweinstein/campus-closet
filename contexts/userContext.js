import React, { createContext, useState, useEffect } from 'react';
import { db } from '../firebase-config'; // Adjust according to your project structure

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const unsubscribe = db.collection('users').onSnapshot(snapshot => {
            const userData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(userData);
        });

        return () => unsubscribe();
    }, []);

    return <UserContext.Provider value={users}>{children}</UserContext.Provider>;
};