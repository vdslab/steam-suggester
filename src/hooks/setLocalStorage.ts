'use client'
const setLocalStorage = (data:any) => {

  if (typeof window !== "undefined") {
    localStorage.setItem('userPreference', JSON.stringify(data))
  }

}

export default setLocalStorage