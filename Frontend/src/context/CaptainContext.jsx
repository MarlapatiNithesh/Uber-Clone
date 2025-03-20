import { createContext, useState } from "react";

export const CaptainDataContext = createContext();
 

const CaptainContext = ({ children }) => {
  const [captain, setCaptain] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <CaptainDataContext.Provider value={{ captain, setCaptain, isLoaded, setIsLoaded }}>
      {children}
    </CaptainDataContext.Provider>
  );
};

export default CaptainContext;
