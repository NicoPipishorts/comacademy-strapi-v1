module.exports = {
  routes: [
    {
      method: "GET",
      path: "/random-questions/:userId", // `userId` is now part of the route path
      handler: "random-questions.getRandomQuestions",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
