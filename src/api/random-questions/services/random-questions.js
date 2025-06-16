const _ = require("lodash");

module.exports = {
  async getQuestionsForUser(userId) {
    // Fetch answered questions for the user, populating related question data
    const answeredQuestions = await strapi.db
      .query("api::game-question.game-question")
      .findMany({
        where: { userId },
        populate: ["questionId"], // Populates the associated question data
      });

    // Extract question IDs and correctness status
    const answeredQuestionIds = answeredQuestions.map((a) => a.questionId.id);
    const incorrectAnswers = answeredQuestions.filter(
      (a) => a.answer !== a.questionId.ANSWER
    );
    const incorrectQuestionIds = incorrectAnswers.map((a) => a.questionId.id);

    let eligibleQuestions;

    if (answeredQuestionIds.length === 0) {
      // If no answered questions, fetch 15 random questions
      eligibleQuestions = await strapi.db
        .query("api::question.question")
        .findMany({
          where: { ACTIVE: true },
          limit: 15,
          orderBy: { createdAt: "desc" }, // Sort by creation date
        });
    } else {
      // Fetch questions not yet answered by the user
      eligibleQuestions = await strapi.db
        .query("api::question.question")
        .findMany({
          where: {
            id: { $notIn: answeredQuestionIds }, // Exclude already answered questions
            ACTIVE: true,
          },
          limit: 15,
          orderBy: { createdAt: "desc" },
        });

      // If fewer than 15 questions are available, add incorrectly answered questions
      if (eligibleQuestions.length < 15) {
        const remainingQuestions = await strapi.db
          .query("api::question.question")
          .findMany({
            where: {
              id: { $in: incorrectQuestionIds },
              ACTIVE: true,
            },
            limit: 15 - eligibleQuestions.length,
            orderBy: { createdAt: "desc" },
          });

        eligibleQuestions = [...eligibleQuestions, ...remainingQuestions];
      }
    }

    // Process categories for fair distribution
    const categoryCounts = {};
    const finalQuestions = eligibleQuestions.map((q) => {
      const categorieList = q.CATEGORIE?.split(",") || [];

      let selectedCategorie;

      if (categorieList.length === 1) {
        // If only one category, assign it directly
        selectedCategorie = categorieList[0];
      } else {
        // If multiple categories, select one to balance distribution
        categorieList.sort(
          (a, b) => (categoryCounts[a] || 0) - (categoryCounts[b] || 0)
        );
        selectedCategorie = categorieList[0];
      }

      // Track category usage
      categoryCounts[selectedCategorie] =
        (categoryCounts[selectedCategorie] || 0) + 1;

      return {
        id: q.id,
        attributes: {
          ...q,
          CATEGORIE: selectedCategorie,
        },
      };
    });

    // Prepare final payload
    return {
      data: finalQuestions,
      meta: {
        pagination: {
          page: 1,
          pageSize: 15,
          pageCount: 1,
          total: finalQuestions.length,
        },
      },
    };
  },
};
