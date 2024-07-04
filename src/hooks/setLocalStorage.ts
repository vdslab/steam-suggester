'use client'
const setLocalStorage = (data:any) => {

  localStorage.setItem('userPreference', JSON.stringify(data))

}

export default setLocalStorage