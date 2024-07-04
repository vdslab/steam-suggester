const setLocalstrage = (data:any) => {

  localStorage.setItem('userPreference', JSON.stringify(data))

}

export default setLocalstrage