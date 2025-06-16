"use strict";

module.exports = {
  async endOfGameSession(ctx) {
    const { userId } = ctx.params;

    try {
      // Count the total number of questions answered by the user
      const totalAnsweredQuestions = await strapi.db
        .query("api::game-question.game-question")
        .count({
          where: { userId: userId },
        });

      if (!totalAnsweredQuestions) {
        return ctx.badRequest("No answered questions found for this user.");
      }

      // Round totalAnsweredQuestions to the nearest multiple of 15
      const roundedTotalAnsweredQuestions =
        Math.round(totalAnsweredQuestions / 15) * 15;

      // Retrieve the round data where points match the rounded total answered questions
      const roundData = await strapi.db.query("api::round.round").findOne({
        where: { points: roundedTotalAnsweredQuestions },
        populate: ["commentaires"],
      });

      if (!roundData) {
        return ctx.badRequest(
          `No round data found matching the total answered questions. TotalQuestions ${totalAnsweredQuestions} (Rounded: ${roundedTotalAnsweredQuestions}) | userId: ${userId}`
        );
      }

      // Build the response payload
      const payload = {
        data: {
          roundCommentaire: roundData.commentaires,
          totalAnsweredQuestions,
        },
      };

      return payload;
    } catch (error) {
      strapi.log.error(error);
      return ctx.internalServerError("Something went wrong.");
    }
  },

  async sessionResults(ctx) {
    const { gameId } = ctx.params;

    try {
      const gameQuestions = await strapi.db
        .query("api::game-question.game-question")
        .findMany({
          where: { gameId: gameId },
          populate: ["questionId"],
          limit: 15,
        });

      if (gameQuestions.length === 0) {
        return ctx.badRequest("No questions found for this game session.");
      }

      let correctAnswers = 0;
      let totalPoints = 0;

      const allQuestions = gameQuestions.map((gameQuestion) => {
        const { answer, questionId } = gameQuestion;
        const questionAnswer = questionId.ANSWER; // Convert correct answer to boolean
        const userAnswer = answer; // Convert user answer to boolean

        if (userAnswer === questionAnswer) {
          correctAnswers += 1;
          totalPoints += questionId.COEF;
        }

        return {
          id: questionId.id,
          question: questionId.QUESTION,
          coef: questionId.COEF,
          questionAnswer,
          userAnswer,
        };
      });

      const percentageCorrect = (correctAnswers / gameQuestions.length) * 100;

      const payload = {
        data: {
          correctAnswers,
          totalCorrectlyAnsweredQuestions: correctAnswers,
          percentageCorrect,
          totalPoints,
          allQuestions,
        },
      };

      return payload;
    } catch (error) {
      strapi.log.error(error);
      return ctx.internalServerError("Something went wrong.");
    }
  },
};
