"use client";

import React from "react";

type Props = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  hasDivider?: boolean; // 区切り線の表示
};

const Section: React.FC<Props> = ({ title, icon, children, hasDivider = true }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-white text-md font-medium flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
      </h3>
      {children}
      {hasDivider && <hr className="border-t border-gray-600 my-4" />}
    </div>
  );
};

export default Section;
