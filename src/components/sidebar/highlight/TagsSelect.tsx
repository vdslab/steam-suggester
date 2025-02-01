'use client';

import { TAG_LIST } from "@/constants/TAG_LIST";
import { useState } from "react";
import CancelIcon from "@mui/icons-material/Cancel";
import IconButton from "@mui/material/IconButton";
import AutoCompleteBox from "@/components/sidebar/highlight/AutoCompleteBox";

type Props = {
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
};

const TagsSelect = (props: Props) => {
  const { selectedTags, setSelectedTags } = props;
  const [searchQuery, setSearchQuery] = useState<string>("");

  const searchList: string[] = [
    ...new Set(
      Object.values(TAG_LIST)
        .flat()
        .filter((key) => key.toLowerCase().includes(searchQuery.toLowerCase()))
    ),
  ].filter((tag) => !selectedTags.includes(tag));

  const AddSelectedTags = (event: any, value: string | null) => {
    if (value && !selectedTags.includes(value)) {
      setSelectedTags([...selectedTags, value]);
    }
    setSearchQuery("");
  };

  const deleteSelectedTags = (value: string) => {
    const index = selectedTags.indexOf(value);
    if (index > -1) {
      const newTags = [...selectedTags];
      newTags.splice(index, 1);
      setSelectedTags(newTags);
    }
  };

  return (
    <div>
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
          (value: string, index: number) =>
            value && (
              <span
                key={`${value}-${index}`}
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
  );
};

export default TagsSelect;