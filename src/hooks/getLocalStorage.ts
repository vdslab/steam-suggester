'use client'
const getLocalStorage = () => {

  if (typeof window !== "undefined") {
    const localData = localStorage.getItem("userPreference")
    return localData ? JSON.parse(localData) : {}
  }

  return null
}

export default getLocalStorage