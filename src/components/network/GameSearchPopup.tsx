// components/GameSearchPopup.tsx
"use client";

import React from "react";
import SelectParameter from "./selectParameter/SelectParameter";
import Panel from "./Panel";
import CloseIcon from "@mui/icons-material/Close";
import { Filter } from "@/types/api/FilterType";

type Props = {
  filter: Filter;
  setFilter: React.Dispatch<React.SetStateAction<Filter>>;
  setIsNetworkLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onClose: () => void;
};

const GameSearchPopup: React.FC<Props> = ({
  filter,
  setFilter,
  setIsNetworkLoading,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
      <div className="bg-gray-800 rounded-lg w-11/12 md:w-3/4 lg:w-1/2 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-400"
        >
          <CloseIcon />
        </button>
        <h2 className="text-2xl mb-4 text-white">ゲームを簡単に探す</h2>
        <SelectParameter
          filter={filter}
          setFilter={setFilter}
          setIsNetworkLoading={setIsNetworkLoading}
        />
      </div>
    </div>
  );
};

export default GameSearchPopup;
