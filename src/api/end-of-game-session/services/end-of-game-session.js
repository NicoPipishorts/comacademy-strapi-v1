"use strict";

module.exports = {
  async findGameSessionAndRound(userId) {
    const totalAnsweredQuestions = await strapi.db
      .query("api::game-question.game-question")
      .count({
        where: { userId: userId },
      });

    const roundData = await strapi.db.query("api::round.round").findOne({
      where: { points: { $lte: totalAnsweredQuestions } },
      orderBy: { points: "desc" },
      populate: ["commentaires"],
    });

    return { totalAnsweredQuestions, roundData };
  },
};
