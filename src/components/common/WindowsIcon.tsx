type Props = {
  size?: number
  color?: string
}

const WindowsIcon = (props:Props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      width={ props.size || 20 }
      height={ props.size || 20 }
    >
      <path
        d="M26 6H42V22H26zM38 42H26V26h16v12C42 40.209 40.209 42 38 42zM22 22H6V10c0-2.209 1.791-4 4-4h12V22zM6 26H22V42H6z"
        fill={ props.color || "white"}
      />
    </svg>
  )
}

export default WindowsIcon