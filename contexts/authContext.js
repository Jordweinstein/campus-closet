import React, { createContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isProfileComplete, setIsProfileComplete] = useState(false);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (authenticatedUser) => {
            if (authenticatedUser) {
                // Assume you have a method to check if the user's profile is complete
                checkUserProfileComplete(authenticatedUser).then(complete => {
                    setIsProfileComplete(complete);
                    setUser(authenticatedUser);
                });
            } else {
                setUser(null);
                setIsProfileComplete(false);
            }
        });
        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, isProfileComplete }}>
            {children}
        </AuthContext.Provider>
    );
};

const checkUserProfileComplete = async (user) => {
    if (user.emai === null || user.email === '') {
        return false; 
    } else {
        return true;
    }
};