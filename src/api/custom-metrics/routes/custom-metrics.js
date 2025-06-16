module.exports = {
  routes: [
    {
      method: "POST",
      path: "/custom-metrics/page-metrics/:page",
      handler: "custom-metrics.updatePageMetric",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/custom-metrics/page-metrics/:page?",
      handler: "custom-metrics.pageMetrics",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
