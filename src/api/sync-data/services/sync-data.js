"use strict";

module.exports = {
  async fetchUpdatedRecords(lastSyncedAt) {
    try {
      // Build the query filter
      const filters = lastSyncedAt
        ? { updatedAt: { $gt: new Date(lastSyncedAt) } }
        : {};

      // Fetch updated records from the `dico` table
      const updatedRecords = await strapi.db.query("api::dico.dico").findMany({
        where: filters,
        orderBy: { updatedAt: "asc" }, // Ensures records are returned in order of updates
      });

      return updatedRecords;
    } catch (error) {
      strapi.log.error("Error in sync-data service:", error);
      throw new Error("Failed to fetch updated records.");
    }
  },
};
