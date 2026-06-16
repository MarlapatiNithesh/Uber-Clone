import { createContext, useEffect, useState } from "react";

export const CaptainDataContext = createContext();

const CaptainContext = ({ children }) => {
  const [captain, setCaptain] = useState(() => {
    const storedCaptain = localStorage.getItem("captain");
    return storedCaptain ? JSON.parse(storedCaptain) : null;
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (captain) {
      console.log("Captain is updated:", captain);
      localStorage.setItem("captain", JSON.stringify(captain));
    } else {
      // Clear localStorage if captain is null (user logs out)
      localStorage.removeItem("captain");
    }
  }, [captain]);

  return (
    <CaptainDataContext.Provider value={{ captain, setCaptain, isLoaded, setIsLoaded }}>
      {children}
    </CaptainDataContext.Provider>
  );
};

export default CaptainContext;
