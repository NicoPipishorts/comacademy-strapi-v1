const fetch = require("node-fetch");

module.exports = {
  async sendNotification(ctx) {
    const { token, title, body } = ctx.request.body;

    const message = {
      to: token, // Expo push token from the app
      sound: "default",
      title, // Notification title
      body, // Notification body message
      data: { someData: "goes here" }, // Optional: additional data payload
    };

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const data = await response.json();
    ctx.send(data);
  },
};
