import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import React from 'react'

type Props = {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  searchList: string[];
  AddSelectedList: (event: any, value: string | null) => void;
  placeholder: string;
  noOptionsText: string;
}

const AutoCompleteBox = (props: Props) => {

  const { searchQuery, setSearchQuery, searchList, AddSelectedList, placeholder, noOptionsText} = props;

  return (
    <div className="flex flex-col">
      <Autocomplete
        disablePortal
        options={searchList}
        sx={{
          width: 300,
          "& .MuiInputBase-root": {
            color: "white", // 文字の色
            borderColor: "white", // 入力フィールドの枠線の色
            backgroundColor: "#374151"
          },
          "& .MuiOutlinedInput-root": {
            "&.Mui-focused fieldset": {
              borderColor: "white", // フォーカス時の枠線の色
              borderWidth: 1, // フォーカス時の枠線の太さ
            },
          },
          "& .MuiInputLabel-root": {
            color: "white", // ラベルの文字色
          },
          "& .MuiAutocomplete-option": {
            color: "white", // ドロップダウン内の候補の文字色
            backgroundColor: "black", // ドロップダウンの背景色
            "&:hover": {
              backgroundColor: "#f0f0f0", // ホバー時の背景色
            },
          },
        }}
        inputValue={searchQuery}
        onInputChange={(_event, newInputValue) => setSearchQuery(newInputValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            variant="outlined"
            size="small"
            autoComplete="off"
          />
        )}
        onChange={AddSelectedList}
        noOptionsText={noOptionsText}
      />
    </div>
  )
}

export default AutoCompleteBox