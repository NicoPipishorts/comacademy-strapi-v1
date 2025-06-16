"use strict";

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    try {
      const { scheduleRandomFeedTask } = require("../config/cron-tasks");
      console.log("Initializing random feed task...");
      await scheduleRandomFeedTask({ strapi });
    } catch (error) {
      console.error("Error initializing random feed task:", error);
    }
  },
};
