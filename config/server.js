const crontTasks = require("./cron-tasks");

module.exports = ({ env }) => {
  let url;

  switch (env("NODE_ENV")) {
    case "local":
      url = "http://localhost:1337";
      break;
    case "staging":
      url = "https://comacademy.leshorts.com";
      break;
    case "production":
      url = "https://strapi.comacademy.fr";
      break;
    default:
      url = "http://localhost:1337";
  }

  return {
    host: env("HOST", "0.0.0.0"),
    port: env.int("PORT", 1337),
    cron: {
      enabled: true,
      tasks: crontTasks,
    },
    url: url,
    app: {
      keys: env.array("APP_KEYS"),
    },
    webhooks: {
      populateRelations: env.bool("WEBHOOKS_POPULATE_RELATIONS", false),
    },
    routes: ["api::random-questions.random-questions"],
  };
};
