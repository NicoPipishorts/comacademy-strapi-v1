module.exports = {
  async getRandomQuestions(ctx) {
    try {
      const { userId } = ctx.params; // Extract userId from route parameters

      if (!userId) {
        return ctx.badRequest("Missing userId parameter");
      }

      // Fetch random questions using the service
      const questions = await strapi
        .service("api::random-questions.random-questions")
        .getQuestionsForUser(userId);

      return ctx.send(questions);
    } catch (error) {
      console.error(error);
      ctx.internalServerError("An error occurred while fetching questions");
    }
  },
};
