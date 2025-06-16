module.exports = {
  async calculateScores(userId = null, roleName = null) {
    const query = {};
    if (userId) {
      query.id = userId;
    }

    // Fetch all confirmed users
    const users = await strapi.db
      .query("plugin::users-permissions.user")
      .findMany({
        where: {
          confirmed: true,
          ...query,
          ...(roleName ? { "role.name": roleName } : {}), // Filter by roleName if provided
        },
        populate: ["id", "firstName", "lastName", "role", "clients"], // Populate clients
      });

    const results = [];

    for (const user of users) {
      const { id: userId, firstName, lastName, profile, role, clients } = user;

      // Fetch all game-question data for this user
      const gameQuestions = await strapi.db
        .query("api::game-question.game-question")
        .findMany({
          where: { userId: userId },
          populate: ["questionId"],
        });

      let totalScore = 0;
      let totalAnsweredQuestions = 0;
      let correctAnswers = 0;
      const scoreByCategories = {};

      if (gameQuestions.length > 0) {
        // User has played the game, calculate scores
        for (const gameQuestion of gameQuestions) {
          const question = gameQuestion.questionId;
          const questionAnswer = question.ANSWER;
          const coef = question.COEF;

          // Check if the answer is correct
          if (gameQuestion.answer === questionAnswer) {
            totalScore += coef;
            correctAnswers += 1;
          }

          totalAnsweredQuestions += 1;

          // Calculate score by category
          const category = gameQuestion.categorie;
          if (!scoreByCategories[category]) {
            scoreByCategories[category] = {
              totalScore: 0,
              correctAnswers: 0,
              totalQuestions: 0,
            };
          }

          scoreByCategories[category].totalQuestions += 1;

          if (gameQuestion.answer === questionAnswer) {
            scoreByCategories[category].totalScore += coef;
            scoreByCategories[category].correctAnswers += 1;
          }
        }
      } else {
        // User has not played any games
        totalAnsweredQuestions = 0;
        correctAnswers = 0;
        totalScore = 0;
      }

      const totalPercentageCorrect = totalAnsweredQuestions
        ? (correctAnswers / totalAnsweredQuestions) * 100
        : 0;

      // Prepare the payload for the user
      const userPayload = {
        id: userId,
        attributes: {
          user: {
            userId,
            firstName,
            lastName,
            profile,
            role: role ? role.name : "No Role", // Add role information
            clients: clients.map((client) => ({
              id: client.id,
              name: client.nom,
            })), // Include only id and name
          },
          totalScore,
          totalAnsweredQuestions,
          totalPercentageCorrect,
          scoreByCategories: {},
        },
      };

      // Fill in score by category, default to 0 if no data
      for (let i = 1; i <= 6; i++) {
        const categoryData = scoreByCategories[i] || {
          totalScore: 0,
          correctAnswers: 0,
          totalQuestions: 0,
        };
        const percentageCorrect = categoryData.totalQuestions
          ? (categoryData.correctAnswers / categoryData.totalQuestions) * 100
          : 0;
        userPayload.attributes.scoreByCategories[i] = {
          totalScore: categoryData.totalScore,
          percentageCorrect,
        };
      }

      results.push(userPayload);
    }

    // Sort the results by totalScore in descending order
    results.sort((a, b) => b.attributes.totalScore - a.attributes.totalScore);

    return results;
  },
};
