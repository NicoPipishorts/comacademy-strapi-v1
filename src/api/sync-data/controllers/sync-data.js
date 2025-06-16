"use strict";

module.exports = {
  async sync(ctx) {
    try {
      const { lastSyncedAt } = ctx.query;

      // Validate the input
      if (lastSyncedAt && isNaN(Date.parse(lastSyncedAt))) {
        return ctx.badRequest("Invalid lastSyncedAt date format");
      }

      // Call the service to get updated records
      const data = await strapi
        .service("api::sync-data.sync-data")
        .fetchUpdatedRecords(lastSyncedAt);

      return ctx.send({
        success: true,
        data,
        message: "Synchronization successful.",
      });
    } catch (error) {
      strapi.log.error("Error in sync-data controller:", error);
      return ctx.internalServerError(
        "An error occurred during synchronization."
      );
    }
  },
};
