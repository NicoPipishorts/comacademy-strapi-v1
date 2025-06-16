module.exports = {
  async saveToken(ctx) {
    try {
      const { token, userId } = ctx.request.body;

      if (!token || !userId) {
        return ctx.badRequest("Token and userId are required");
      }

      // Check if the token already exists using db.query
      const existingToken = await strapi.db
        .query("api::push-token.push-token")
        .findMany({
          where: { token },
        });

      if (existingToken.length === 0) {
        // Save the new token using db.query
        await strapi.db.query("api::push-token.push-token").create({
          data: {
            token,
            userId: userId, // Assuming 'user' is a relation to the User model
          },
        });
      }

      ctx.send({ message: "Token saved successfully" });
    } catch (err) {
      console.error("Error saving token:", err);
      return ctx.internalServerError(
        "An error occurred while saving the push token."
      );
    }
  },
};
