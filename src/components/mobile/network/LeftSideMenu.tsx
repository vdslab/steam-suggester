'use client'
import { IconButton } from "@mui/material"
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from "react";

const LeftSideMenu = () => {

  const [showMenu, setShowMenu] = useState(false);

  return (
    <div>
      
      {showMenu ?
      <div className="fixed top-0 left-0 w-60 h-screen bg-stone-950 z-50">
        <div className="flex justify-end border-b-2 mb-2">
          <IconButton onClick={() => setShowMenu(!showMenu)}>
            <CloseIcon fontSize="large" sx={{ fill: "white" }} />
          </IconButton>
        </div>
        <div className="flex flex-col space-y-5 items-center justify-center">
          <a href="/" className="text-white text-2xl"></a>
          <a href="/auth" className="text-white text-2xl">Login</a>
          <a href="/auth" className="text-white text-2xl">Register</a>
        </div>
      </div>
      :
      <IconButton onClick={() => setShowMenu(!showMenu)}>
        <MenuIcon fontSize="large" sx={{ fill: "white" }} />
      </IconButton>
      }
    </div>
  )
}

export default LeftSideMenu