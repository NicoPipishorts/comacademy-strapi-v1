module.exports = {
  routes: [
    {
      method: "GET",
      path: "/playlists/:userId/:type/:elementId",
      handler: "playlist.checkElementInPlaylists",
      config: {
        policies: [], // Add any required policies
      },
    },
    {
      method: "DELETE",
      path: "/playlist/delete/:id",
      handler: "playlist.deletePlaylist",
      config: {
        policies: [], // Enforces authentication
      },
    },
  ],
};
