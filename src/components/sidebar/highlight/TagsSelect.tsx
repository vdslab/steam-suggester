'use client';

import { TAG_LIST } from "@/constants/TAG_LIST";
import { useState } from "react";
import CancelIcon from "@mui/icons-material/Cancel";
import IconButton from "@mui/material/IconButton";
import AutoCompleteBox from "@/components/sidebar/highlight/AutoCompleteBox";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import Button from "@mui/material/Button";

type Props = {
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  defaultTags?: string[];
};


const TagsSelect = (props:Props) => {

  const { selectedTags, setSelectedTags, defaultTags } = props;

  const [searchQuery, setSearchQuery] = useState<string>("");

  const searchList: string[] = [
    ...new Set(
      Object.values(TAG_LIST)
        .flat()
        .filter(
          (key) =>
            !selectedTags.includes(key) &&
            key.toLowerCase().includes(searchQuery.toLowerCase())
        )
    ),
  ];

  const AddSelectedTags = (event: any, value: string | null) => {
    if (value) {
      setSelectedTags([...selectedTags, value]);
      setSearchQuery("");
    }
  };

  const deleteSelectedTags = (value: string) => {
    setSelectedTags([...selectedTags.filter((tag: string) => tag !== value)]);
  };


  return (
    <div>
      {/* 全解除 */}
      <Button
        onClick={() => setSelectedTags(defaultTags ? defaultTags : [])}
        variant="outlined"
        startIcon={<RefreshOutlinedIcon />}
        sx={{ mb: 2 }}
      >
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
        {selectedTags.map(
          (value: string) =>
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
        )}
      </div>
    </div>
  )
}

export default TagsSelect