module.exports = {
  routes: [
    {
      method: "POST",
      path: "/save-token",
      handler: "push-token.saveToken",
      config: {
        policies: [],
      },
    },
  ],
};
