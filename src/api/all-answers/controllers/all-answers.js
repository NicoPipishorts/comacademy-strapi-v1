"use strict";

module.exports = {
  async findAllAnswers(ctx) {
    try {
      const userId = ctx.params.userId || ctx.state.user?.id;

      // Define where clause to filter by userId if provided
      const whereClause = userId ? { userId } : {};

      // Fetch game-question entries with relations to the question table
      const results = await strapi.db
        .query("api::game-question.game-question")
        .findMany({
          where: whereClause,
          populate: { questionId: true },
          orderBy: { createdAt: "desc" }, // Order from youngest to oldest
        });

      // Fetch the total number of questions available in the question table
      const allQuestions = await strapi.db
        .query("api::question.question")
        .count();

      // Remove duplicates by keeping only the most recent answer per question
      const uniqueAnswers = {};
      results.forEach((result) => {
        const questionId = result.questionId.id;
        if (!uniqueAnswers[questionId]) {
          uniqueAnswers[questionId] = result;
        }
      });

      // Total number of unique answered questions (without duplications)
      const allUserQuestions = Object.keys(uniqueAnswers).length;

      // Format the payload
      const data = Object.values(uniqueAnswers).map((item) => ({
        id: item.id,
        attributes: {
          userAnswer: item.answer,
          questionAnswer: item.questionId.ANSWER,
          questionId: item.questionId.id,
          question: item.questionId.QUESTION,
        },
      }));

      // Return the formatted payload with additional keys
      ctx.send({
        data,
        allQuestions,
        allUserQuestions,
      });
    } catch (error) {
      ctx.internalServerError("Something went wrong", error);
    }
  },
};
