'use client'
const getLocalStorage = () => {

  const localData = localStorage.getItem("userPreference")

  return localData
}

export default getLocalStorage