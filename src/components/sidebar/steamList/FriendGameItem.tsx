
import { IconButton, Avatar, AvatarGroup } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

type FriendGameItemProps = {
  game: GetFriendGamesResponse;
  onSelect: () => void;
  nodeIndex: number;
}

const FriendGameItem = ({ game, onSelect, nodeIndex }: FriendGameItemProps) => {
  return (
    <div className="p-2 mb-2 bg-gray-900 rounded-lg relative group">
      <div className="flex items-center justify-between">
        <div className="p-2 " onClick={onSelect}>
          {game.gameName}
          {nodeIndex !== -1 &&
            <IconButton size="small" sx={{ color: "white" }} onClick={onSelect}>
              <SearchIcon />
            </IconButton>
          }
        </div>
        <div className="hidden md:inline-block">
          <AvatarGroup max={3} spacing={"small"}>
            {game.friends.map((friend, friendIndex) => (
              <Avatar key={friendIndex} alt={friend.name} src={friend.avatar} />
            ))}
          </AvatarGroup>
        </div>
      </div>
      <div className="absolute left-1/2 w-64 top-full mt-2 -translate-x-1/2 bg-gray-800 text-white p-4 rounded-lg border border-gray-600 shadow-xl z-50 hidden group-hover:block opacity-0 group-hover:opacity-100 invisible lg:visible">
        <h4 className="text-lg font-bold mb-2">所持しているフレンドリスト</h4>
        <ul>
          {game.friends.map((friend, friendIndex) => (
            <li key={friendIndex} className="text-sm">
              {friend.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FriendGameItem;