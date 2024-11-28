/* Section.tsx */
"use client";

import React from "react";

type Props = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
};

const Section: React.FC<Props> = ({ title, icon, children }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-white text-md font-medium flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
      </h3>
      {children}
      <hr className="border-gray-600 pb-6" />
    </div>
  );
};

export default Section;
