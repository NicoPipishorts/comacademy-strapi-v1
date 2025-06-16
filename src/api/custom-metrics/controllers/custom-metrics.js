"use strict";

module.exports = {
  async pageMetrics(ctx) {
    const { page } = ctx.params;

    try {
      if (page) {
        const pageMetric = await strapi.entityService.findMany(
          "api::page-metric.page-metric",
          {
            filters: { Page: page },
            limit: 1,
          }
        );

        if (pageMetric.length === 0) {
          return ctx.notFound("No metric found for the given page");
        }

        ctx.send({
          message: "Page metric retrieved successfully",
          data: pageMetric[0],
        });
      } else {
        const allMetrics = await strapi.entityService.findMany(
          "api::page-metric.page-metric",
          {}
        );

        ctx.send({
          message: "All page metrics retrieved successfully",
          data: allMetrics,
        });
      }
    } catch (error) {
      ctx.internalServerError("Something went wrong", { error });
    }
  },

  async updatePageMetric(ctx) {
    const { page } = ctx.params;

    if (!page) {
      return ctx.badRequest("Page parameter is required");
    }

    try {
      const existingEntry = await strapi.entityService.findMany(
        "api::page-metric.page-metric",
        {
          filters: { Page: page },
          limit: 1,
        }
      );

      let result;

      if (existingEntry.length > 0) {
        // Ensure the Count value is treated as a number
        const currentCount = Number(existingEntry[0].Count) || 0;
        const newCount = currentCount + 1;

        result = await strapi.entityService.update(
          "api::page-metric.page-metric",
          existingEntry[0].id,
          {
            data: { Count: newCount },
          }
        );
      } else {
        result = await strapi.entityService.create(
          "api::page-metric.page-metric",
          {
            data: { Page: page, Count: 1 },
          }
        );
      }

      ctx.send({ message: "Metrics updated successfully", data: result });
    } catch (error) {
      ctx.internalServerError("Something went wrong", { error });
    }
  },
};
