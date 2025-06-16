"use strict";

/**
 * feed controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::feed.feed", ({ strapi }) => ({
  async likePost(ctx) {
    try {
      const { elementId } = ctx.params;
      const { userId } = ctx.request.body;

      if (!elementId || !userId) {
        return ctx.badRequest("Element ID and userId are required");
      }

      const updatedFeed = await strapi
        .service("api::feed.feed")
        .incrementLike(elementId, userId);

      return ctx.send({ data: updatedFeed });
    } catch (err) {
      console.error("Error liking feed:", err);
      return ctx.internalServerError(
        "An error occurred while liking the feed."
      );
    }
  },
  async getFeedsByUserId(ctx) {
    try {
      const { userId } = ctx.params;
      const query = ctx.query; // Includes start, limit, filters, etc.

      if (!userId) {
        return ctx.badRequest("User ID is required");
      }

      // Call the service method and pass the query for start and limit
      const result = await strapi
        .service("api::feed.feed")
        .findFeedsByUserId(userId, query);

      return ctx.send(result); // Send back data and meta
    } catch (err) {
      console.error("Error fetching feeds by user ID:", err);
      return ctx.internalServerError("An error occurred while fetching feeds.");
    }
  },
}));
