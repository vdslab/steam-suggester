import React, { forwardRef } from "react";

type Props = {
  size?: number;
  color?: string;
};

const WindowsIcon = forwardRef<SVGSVGElement, Props>(({ size = 20, color = "white", ...rest }, ref) => {
  return (
    <svg
      ref={ref} // MUIのTooltip対応のためrefを設定
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      width={size}
      height={size}
      {...rest} // Tooltipのpropsを適応
    >
      <path
        d="M26 6H42V22H26zM38 42H26V26h16v12C42 40.209 40.209 42 38 42zM22 22H6V10c0-2.209 1.791-4 4-4h12V22zM6 26H22V42H6z"
        fill={color}
      />
    </svg>
  );
});

WindowsIcon.displayName = "WindowsIcon";

export default WindowsIcon;
