import { useScreenSize } from "@visx/responsive";
import { Global } from "@emotion/react";
import { grey } from "@mui/material/colors";
import { styled } from "@mui/material/styles";
import SwipeableDrawer from "@mui/material/SwipeableDrawer/SwipeableDrawer";

type Props = {
  children: React.ReactNode;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Puller = styled("div")(({ theme }) => ({
  width: 30,
  height: 6,
  backgroundColor: grey[300],
  borderRadius: 3,
  position: "absolute",
  top: 8,
  left: "calc(50% - 15px)",
  ...theme.applyStyles("dark", {
    backgroundColor: grey[900],
  }),
  zIndex: 100,
}));

const StyledBox = styled("div")(({ theme }) => ({
  backgroundColor: "#fff",
  ...theme.applyStyles("dark", {
    backgroundColor: grey[800],
  }),
}));

const SwipeContainer = (props: Props) => {
  const { children, setSelectedIndex, open, setOpen } = props;

  const { width, height } = useScreenSize({ debounceTime: 150 });


  const drawerBleeding = height / 3;

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  return (
    <>
      <button
        className={"absolute right-2 px-2 rounded z-50 flex items-center justify-center w-8 h-8 bg-black bg-opacity-50 rounded-full cursor-pointer z-90 transition-transform duration-200"}
        onClick={() => setSelectedIndex(-1)}
        style={{ top: `calc(100% - ${drawerBleeding +40}px)`}}
      >
        <span className="text-white text-xl font-bold transition-colors duration-200 hover:text-red-400">
          ×
        </span>
      </button>
      <Global
        styles={{
          ".MuiDrawer-root > .MuiPaper-root": {
            height: `calc(100% - ${drawerBleeding}px)`,
            overflow: "visible",
          },
        }}
      />
      <SwipeableDrawer
        disableSwipeToOpen={false}
        anchor="bottom"
        open={open}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        swipeAreaWidth={drawerBleeding}
      >
        <StyledBox
          sx={{
            position: "absolute",
            top: -drawerBleeding,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            visibility: "visible",
            right: 0,
            left: 0,
            height: `calc(100% + ${drawerBleeding}px)`,
          }}
        >
          <Puller />
          {children}
        </StyledBox>
      </SwipeableDrawer>
    </>
  );
};

export default SwipeContainer;
