"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/end-of-game-session/:userId",
      handler: "end-of-game-session.endOfGameSession",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/end-of-game-session/results/:gameId",
      handler: "end-of-game-session.sessionResults",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
