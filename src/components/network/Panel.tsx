/* Panel.tsx */
"use client";

import React from "react";

type PanelProps = {
  title: React.ReactNode;
  icon: React.ReactElement;
  children: React.ReactNode;
};

const Panel: React.FC<PanelProps> = ({ title, icon, children }) => {
  return (
    <div className="flex-1 h-[95vh] bg-gray-800 rounded-r-lg p-4 shadow-md flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        {icon}
        <h2 className="text-white text-lg font-semibold">{title}</h2>
      </div>
      <div className="border-t border-gray-700 pt-2">
        {children}
      </div>
    </div>
  );
};

export default Panel;
