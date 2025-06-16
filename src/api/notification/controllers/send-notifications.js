const fetch = require("node-fetch");

module.exports = {
  async sendNotifications(ctx) {
    try {
      const { title, body, data } = ctx.request.body;

      if (!title || !body) {
        return ctx.badRequest(
          "Title and body are required for sending notifications."
        );
      }

      // Fetch all push tokens from the push-token table
      const pushTokens = await strapi.db
        .query("api::push-token.push-token")
        .findMany();

      if (!pushTokens || pushTokens.length === 0) {
        return ctx.send({ message: "No push tokens found." });
      }

      // Prepare the notification messages for each token
      const messages = pushTokens.map((tokenRecord) => ({
        to: tokenRecord.token,
        sound: "default",
        title: title,
        body: body,
        data: data || {}, // Optional additional data payload
      }));

      // Send the notifications using Expo's Push API
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
      });

      const responseData = await response.json();

      // Handle errors from the Expo Push API
      if (responseData.errors) {
        console.error("Error sending notifications:", responseData.errors);
        return ctx.internalServerError("Failed to send push notifications.");
      }

      return ctx.send({
        message: "Push notifications sent successfully.",
        data: responseData,
      });
    } catch (err) {
      console.error("Error in sendNotifications:", err);
      return ctx.internalServerError(
        "An error occurred while sending push notifications."
      );
    }
  },
};
