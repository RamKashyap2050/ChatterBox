import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);


  useEffect(() => {
    console.log("Verifying user on component mount...");
    const verifyUser = async () => {
        try {
            console.log("Sending request to verify user...");
            const response = await axios.get("/Users/verify", { withCredentials: true });
            console.log("Received verification response:", response);
            if (response.data && response.data.user) {
                console.log("User data is present, setting user...");
                setUser(response.data.user);
            } else {
                console.log("User data is absent in response, setting user to null...");
                setUser(null);
            }
        } catch (error) {
            console.error("Error during user verification, setting user to null:", error);
            setUser(null);
        }
    };

    verifyUser();
}, []);


  

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
