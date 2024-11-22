/* src/components/network/Header.tsx */

"use client";

import { AppBar, Toolbar, IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

type HeaderProps = {
  onLeftMenuClick: () => void;
  onRightMenuClick: () => void;
};

const Header = ({ onLeftMenuClick, onRightMenuClick }: HeaderProps) => {
  return (
    <AppBar position="static" className="bg-stone-800">
      <Toolbar>
        {/* Mobile: Show left menu button */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open left drawer"
          onClick={onLeftMenuClick}
          className="md:hidden"
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" className="flex-grow text-center">
          Game Network Visualization
        </Typography>

        {/* Mobile: Show right menu button */}
        <IconButton
          edge="end"
          color="inherit"
          aria-label="open right drawer"
          onClick={onRightMenuClick}
          className="md:hidden"
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
