
import { IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

type OwnedGameItemProps = {
  game: GetSteamOwnedGamesResponse;
  onSelect: () => void;
  nodeIndex: number;
}

const OwnedGameItem = ({ game, onSelect, nodeIndex}: OwnedGameItemProps) => {
  return (
    <div className="p-2 mb-2 bg-gray-900 rounded-lg text-white">
      <div className="flex items-center justify-between">
        <div className="p-2">{game.title}</div>
        {nodeIndex !== -1 && (
          <IconButton sx={{ color: "white" }} onClick={onSelect}>
            <SearchIcon />
          </IconButton>
        )}
      </div>
    </div>
  );
};

export default OwnedGameItem;