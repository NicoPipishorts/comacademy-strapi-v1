module.exports = {
  routes: [
    {
      method: "POST",
      path: "/send-notification",
      handler: "notification.sendNotification",
      config: {
        policies: [],
      },
    },
  ],
};
