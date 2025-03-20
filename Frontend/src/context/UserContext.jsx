import React, { createContext } from 'react'

export const UserDataContext=createContext(null)

const UserContext = ({children}) => {
  return (
    <div>
        <UserDataContext.Provider value={{}}>{children}</UserDataContext.Provider>
    </div>
  )
}

export default UserContext