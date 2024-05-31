const UnixToDate = (unix: number):Date => {

  const date = new Date(unix * 1000);

  return date
}

export default UnixToDate
