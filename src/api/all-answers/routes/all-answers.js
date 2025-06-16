module.exports = {
  routes: [
    {
      method: "GET",
      path: "/all-answers", // Without userId param (returns for all users)
      handler: "all-answers.findAllAnswers",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/all-answers/:userId", // With userId param (returns for a specific user)
      handler: "all-answers.findAllAnswers",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
