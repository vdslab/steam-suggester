/* ToggleDisplay.tsx */
"use client";

import React, { useState } from "react";
import Popularity from "./Popularity2";
import DistributorVideos from "./DistributorVideos2";
import { Tabs, Tab, Box } from "@mui/material";

type Props = {
  nodes: any[];
  selectedIndex: number;
};

const ToggleDisplay: React.FC<Props> = ({ nodes, selectedIndex }) => {
  // タブの状態を管理
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: "100%", mt: 0 }}>
      {/* タブ付きナビゲーションバー */}
      <Tabs
        value={activeTab}
        onChange={handleChange}
        centered
        textColor="primary"
        indicatorColor="primary"
        sx={{
          "& .MuiTab-root": {
            color: "white", // Default text color for tabs
          },
          "& .Mui-selected": {
            color: "primary.main", // Text color for selected tab
          },
        }}
      >
        <Tab label="Popularity" />
        <Tab label="Distributor Videos" />
      </Tabs>

      {/* タブの内容 */}
      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && (
          <Popularity nodes={nodes} selectedIndex={selectedIndex} />
        )}
        {activeTab === 1 && (
          <DistributorVideos nodes={nodes} selectedIndex={selectedIndex} />
        )}
      </Box>
    </Box>
  );
};

export default ToggleDisplay;
