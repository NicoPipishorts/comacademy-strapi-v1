"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/total-scores",
      handler: "total-scores.getTotalScores",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/total-scores/:userId",
      handler: "total-scores.getTotalScores",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
