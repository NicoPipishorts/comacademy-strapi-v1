"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/sync-data",
      handler: "sync-data.sync",
      config: {
        policies: [], // Add policies here if needed
        middlewares: [], // Add middlewares here if needed
      },
    },
  ],
};
