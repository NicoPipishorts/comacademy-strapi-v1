"use strict";

/**
 * feed service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::feed.feed", ({ strapi }) => ({
  async incrementLike(elementId, userId) {
    const feed = await strapi.entityService.findOne(
      "api::feed.feed",
      elementId,
      {
        populate: { userId: true },
      }
    );

    if (!feed) {
      throw new Error("Feed item not found");
    }

    const currentUserIds = feed.userId.map((u) => u.id);
    const currentLikes = Number(feed.likes) || 0;

    let updatedLikes;
    let updatedUserIds;

    if (currentUserIds.includes(userId)) {
      updatedUserIds = currentUserIds.filter((id) => id !== userId);
      updatedLikes = currentLikes - 1;
    } else {
      updatedUserIds = [...currentUserIds, userId];
      updatedLikes = currentLikes + 1;
    }

    const updatedFeed = await strapi.entityService.update(
      "api::feed.feed",
      elementId,
      {
        data: {
          likes: updatedLikes,
          userId: updatedUserIds,
        },
      }
    );

    return updatedFeed;
  },
  async findFeedsByUserId(userId, query) {
    try {
      const { start = 0, limit = 10 } = query; // Default to start 0, 10 items per page
      const stringUserId = userId.toString();

      // Fetch the total number of feeds in the database
      const totalFeeds = await strapi.entityService.count("api::feed.feed", {
        filters: {}, // Apply global filters if needed
      });

      // Fetch the feeds for the current page
      const feeds = await strapi.entityService.findMany("api::feed.feed", {
        filters: {}, // Apply global filters if needed
        populate: { userId: true },
        sort: { createdAt: "desc" },
        start: parseInt(start, 10),
        limit: parseInt(limit, 10),
      });

      // Map over the feeds to add `userLiked` logic
      const feedsWithUserLiked = feeds.map((feed) => {
        const userLiked = Array.isArray(feed.userId)
          ? feed.userId.some((user) => user.id.toString() === stringUserId)
          : false;

        const { userId: _, ...rest } = feed; // Exclude `userId` from the response
        return { ...rest, userLiked };
      });

      // Return the feeds with metadata
      return {
        data: feedsWithUserLiked,
        meta: {
          pagination: {
            start: parseInt(start, 10),
            limit: parseInt(limit, 10),
            total: totalFeeds, // Total number of feeds in the database
          },
        },
      };
    } catch (err) {
      console.error("Error in service findFeedsByUserId:", err.message);
      console.error("Stack trace:", err.stack);
      throw new Error("An error occurred while fetching feeds.");
    }
  },
}));
