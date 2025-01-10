"use client";

import { useState } from "react";
import Panel from "../Panel";
import HighlightOutlinedIcon from '@mui/icons-material/HighlightOutlined';
import { TAG_LIST } from "@/constants/TAG_LIST";
import CancelIcon from "@mui/icons-material/Cancel";
import IconButton from "@mui/material/IconButton";
import AutoCompleteBox from "@/components/network/highlight/AutoCompleteBox";
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import Button from "@mui/material/Button";

type Props = {
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
};

const HighlightPanel = (props: Props) => {
  const { selectedTags, setSelectedTags } = props;

  const [searchQuery, setSearchQuery] = useState<string>("");

  const searchList: string[] = Object.values(TAG_LIST).flat().filter(
    (key) =>
      !selectedTags.includes(key) &&
      key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const AddSelectedTags = (event: any, value: string | null) => {
    if (value) {
      setSelectedTags([
        ...selectedTags,
        value
      ]);
      setSearchQuery("");
    }
  };

  const deleteSelectedTags = (value: string) => {
    setSelectedTags([
      ...selectedTags.filter((tag: string) => tag !== value)
    ]);
  };

  return (
    <Panel
      title={
        <div className="flex items-center">
          <span>強調表示</span>
        </div>
      }
      icon={<HighlightOutlinedIcon className="mr-2 text-white" />}
    >
      {/* 説明文を直接表示 */}
      <p className="text-sm text-white mb-4">
        指定のタグを含むゲームを強調表示できます。
      </p>

      <div>
        {/* 全解除 */}
        <Button onClick={() => setSelectedTags([])} variant="outlined" startIcon={<RefreshOutlinedIcon />} sx={{ mb: 2 }}>
          <span className="text-blue">リセット</span>
        </Button>
        
        {/* タグ検索 */}
        <AutoCompleteBox
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchList={searchList}
          AddSelectedList={AddSelectedTags}
          placeholder="タグを入力"
          noOptionsText="該当するタグが見つかりません"
        />

        {/* 選択中のジャンル */}
        <div className="flex flex-wrap mt-2">
          {selectedTags.map((value: string) => (
            value && (
              <span
                key={value}
                className="bg-blue-500 text-xs text-white px-3 py-1 rounded-full mr-2 mb-2 flex items-center shadow-lg transition-all duration-200"
              >
                {value}
                <IconButton
                  onClick={() => deleteSelectedTags(value)}
                  sx={{ p: 0 }}
                >
                  <CancelIcon sx={{ color: "white", fontSize: 14 }} />
                </IconButton>
              </span>
            )
          ))}
        </div>
      </div>
    </Panel>
  );
};

export default HighlightPanel;
