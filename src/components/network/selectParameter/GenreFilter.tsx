import { Filter } from "@/types/api/FilterType";
import { TextField, IconButton, Autocomplete } from "@mui/material";
import { useState } from "react";
import CancelIcon from "@mui/icons-material/Cancel";

type Props = {
  filter: Filter;
  localFilter: Filter;
  setLocalFilter: React.Dispatch<React.SetStateAction<Filter>>;
};

const GenreFilter = (props: Props) => {
  const { filter, localFilter, setLocalFilter } = props;

  const [searchQuery, setSearchQuery] = useState<string>("");

  // 入力値に基づく候補のフィルタリング
  const data = Object.keys(filter.Genres).filter(
    (key) =>
      !localFilter.Genres[key] && key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenreSelect = (event: any, value: string | null) => {
    if (value) {
      setLocalFilter({
        ...localFilter,
        Genres: { ...localFilter.Genres, [value]: true },
      });
      setSearchQuery("");
    }
  };

  return (
    <div>
      <div className="flex flex-col">
        <Autocomplete
          disablePortal
          options={data}
          sx={{
            width: 300,
            "& .MuiInputBase-root": {
              color: "white", // 文字の色
              borderColor: "white", // 入力フィールドの枠線の色
              backgroundColor: "#374151"
            },
            "& .MuiOutlinedInput-root": {
              // "& fieldset": {
              //   borderColor: "gray", // フォーカスしていない状態の枠線の色
              // },
              // "&:hover fieldset": {
              //   borderColor: "white", // ホバー時の枠線の色
              // },
              "&.Mui-focused fieldset": {
                borderColor: "white", // フォーカス時の枠線の色
                borderWidth: 1, // フォーカス時の枠線の太さ
              },
            },
            "& .MuiInputLabel-root": {
              color: "white", // ラベルの文字色
            },
            "& .MuiAutocomplete-option": {
              color: "black", // ドロップダウン内の候補の文字色
              backgroundColor: "white", // ドロップダウンの背景色
              "&:hover": {
                backgroundColor: "#f0f0f0", // ホバー時の背景色
              },
            },
          }}
          inputValue={searchQuery}
          onInputChange={(event, newInputValue) => setSearchQuery(newInputValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="検索"
              variant="outlined"
              size="small"
              autoComplete="off"
            />
          )}
          onChange={handleGenreSelect}
        />
      </div>

      {/* 選択中のジャンル */}
      <div className="flex flex-wrap mt-2">
        {Object.entries(localFilter.Genres).map(([key, value]) => (
          value && (
            <span
              key={key}
              className="bg-blue-600 text-xs text-white px-2 py-1 rounded mr-2 mb-2 flex items-center"
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
    </div>
  );
};

export default GenreFilter;
