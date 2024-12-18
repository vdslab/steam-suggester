type Friends = {
  steamid: string,
  relationship: string,
  friend_since: number
};

type GetFriendListResponse = {
  friendslist: {
    friends: Friends[]
  }
};

type GetOwnedGamesResponse = {
  response: {
    game_count: number,
    games: FriendsGames[]
  }
};

type FriendsGames = {
  appid: string,
  playtime_forever: number,
};

type GetFriendGamesResponse = {
  friends: {
    name: string,
    avatar: string
  }[],
  gameName: string
};

type GetPlayerSummariesResponse = {
  response: {
    players: Player[]
  }
};

type Player = {
  steamid: string,
  communityvisibilitystate: number,
  profilestate: number,
  personaname: string,
  profileurl: string,
  avatar: string,
  avatarmedium: string,
  avatarfull: string,
  avatarhash: string,
  lastlogoff: number,
  personastate: number,
  primaryclanid: string,
  timecreated: number,
  personastateflags: number
};
