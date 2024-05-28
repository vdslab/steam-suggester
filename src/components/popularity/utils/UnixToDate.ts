const UnixToDate = (unix: number):Date => {

  const date = new Date(unix * 1000);
  console.log(date)

  return date
}

export default UnixToDate
