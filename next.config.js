module.exports = {
  images: {
    domains: ["static-cdn.jtvnw.net", "avatars.steamstatic.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "shared.akamai.steamstatic.com",
      },
      {
        protocol: "https",
        hostname: "clips-media-assets2.twitch.tv",
      },
    ],
  },
};
