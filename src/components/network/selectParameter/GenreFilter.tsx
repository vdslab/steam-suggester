import { Filter } from "@/types/api/FilterType";
import { useState } from "react";
import CancelIcon from "@mui/icons-material/Cancel";
import AutoCompleteBox from "@/components/network/highlight/AutoCompleteBox";
import Section from "../Section";
import CategoryIcon from "@mui/icons-material/Category";
import IconButton from "@mui/material/IconButton";

type Props = {
  filter: Filter;
  localFilter: Filter;
  setLocalFilter: React.Dispatch<React.SetStateAction<Filter>>;
};

const GenreFilter = (props: Props) => {
  const { filter, localFilter, setLocalFilter } = props;

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [areAllCategoriesSelected, setAreAllCategoriesSelected] = useState<boolean>(false);

  // 入力値に基づく候補のフィルタリング
  const selectedList = Object.keys(filter.Genres).filter(
    (key) =>
      !localFilter.Genres[key] && key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ジャンルの選択の追加
  const handleGenreSelect = (event: any, value: string | null) => {
    if (value) {
      setLocalFilter({
        ...localFilter,
        Genres: { ...localFilter.Genres, [value]: true },
      });
      setSearchQuery("");
    }
  };

  // カテゴリーの全選択/全解除
  const handleMasterCheckboxChange = () => {
    const newStatus = !areAllCategoriesSelected;
    const newCategories: { [key: string]: boolean } = {};
    for (const key in localFilter.Genres) {
      newCategories[key] = newStatus;
    }
    setLocalFilter({
      ...localFilter,
      Genres: newCategories,
    });
    setAreAllCategoriesSelected(newStatus);
  };
  

  return (
    <Section title="ジャンル" icon={<CategoryIcon />}>

      {/* 全選択 */}
      <div className="flex items-center mb-2">
        <input
          id="master-checkbox"
          type="checkbox"
          className="h-5 w-5 text-gray-600"
          checked={areAllCategoriesSelected}
          onChange={handleMasterCheckboxChange}
        />
        <label htmlFor="master-checkbox" className="select-none cursor-pointer ml-2 text-white">全選択</label>
      </div>

      <AutoCompleteBox
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchList={selectedList}
        AddSelectedList={handleGenreSelect}
        placeholder="ジャンルを入力"
        noOptionsText="該当するジャンルはありません"
      />

      {/* 選択中のジャンル */}
      <div className="flex flex-wrap mt-2">
        {Object.entries(localFilter.Genres).map(([key, value]) => (
          value && (
            <span
              key={key}
              className="bg-blue-500 text-xs text-white px-3 py-1 rounded-full mr-2 mb-2 flex items-center shadow-lg transition-all duration-200"
            >
              {key}
              <IconButton
                onClick={() =>
                  setLocalFilter({
                    ...localFilter,
                    Genres: { ...localFilter.Genres, [key]: false },
                  })
                }
                sx={{ p: 0 }}
              >
                <CancelIcon sx={{ color: "white", fontSize: 14 }} />
              </IconButton>
            </span>
          )
        ))}
      </div>
    </Section>
  );
};

export default GenreFilter;
