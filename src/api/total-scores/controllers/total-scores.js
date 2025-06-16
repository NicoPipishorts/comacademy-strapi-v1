module.exports = {
  async getTotalScores(ctx) {
    try {
      const userId = ctx.params.userId || null; // Capture userId from the URL params, if present
      const roleName = ctx.query.roleName || null; // Capture roleName from query parameters, if provided

      const scoresData = await strapi
        .service("api::total-scores.total-scores")
        .calculateScores(userId, roleName); // Pass both userId and roleName to the service

      ctx.send({ data: scoresData });
    } catch (err) {
      ctx.throw(500, err);
    }
  },
};
