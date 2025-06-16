module.exports = {
  routes: [
    {
      method: "PUT",
      path: "/feed/:elementId/like",
      handler: "feed.likePost",
    },
    {
      method: "GET",
      path: "/feeds/byUserId/:userId",
      handler: "feed.getFeedsByUserId",
    },
  ],
};
