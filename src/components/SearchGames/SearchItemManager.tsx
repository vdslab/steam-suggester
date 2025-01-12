import { SteamListType } from "@/types/NetworkType";

type Props = {
  game: SteamListType;
  handleSelectGame?: (game: SteamListType) => void;
  handleAddGame?: (steamGameId: string) => void;
  handleDeleteGame?: (steamGameId: string) => void;
  setIsFocused: React.Dispatch<React.SetStateAction<boolean>>;
  startIcon: any;
  endIcon?: any;
};

const SearchItemManager = ({
  game,
  handleSelectGame,
  handleAddGame,
  handleDeleteGame,
  setIsFocused,
  startIcon,
  endIcon,
}: Props) => {
  return (
    <div className="flex items-center justify-between">
      <div
        className="flex flex-1 items-center hover:bg-gray-400 px-2"
        onClick={() => {
          handleSelectGame && handleSelectGame(game);
          handleAddGame && handleAddGame(game.steamGameId);
          setIsFocused(false);
        }}
      >
        <div
          style={{
            minWidth: "40px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {startIcon}
        </div>
        <div className="p-2">{game.title}</div>
      </div>
      {handleDeleteGame && (
        <div
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteGame(game.steamGameId);
          }}
        >
          {endIcon}
        </div>
      )}
    </div>
  );
};

export default SearchItemManager;
