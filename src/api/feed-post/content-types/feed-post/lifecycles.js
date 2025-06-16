module.exports = {
  async afterCreate(event) {
    const { result } = event;

    if (result.Immediat === true) {
      await addToFeed(result);
    }
  },

  async afterUpdate(event) {
    const { result } = event;

    if (result.Immediat === true) {
      const existingFeed = await strapi.db.query("api::feed.feed").findMany({
        where: { elementId: result.id }, // Check if already added
      });

      if (existingFeed.length === 0) {
        await addToFeed(result);
      }
    }
  },
};

async function addToFeed(randomItem) {
  try {
    // Debugging: Log the randomItem object before processing
    console.log("Initial Random Item:", randomItem);

    // Fetch related Type and Media with detailed population
    randomItem = await strapi.db.query("api::feed-post.feed-post").findOne({
      where: { id: randomItem.id },
      populate: {
        Type: {
          fields: ["Name"], // Ensure 'Name' is fetched from Type
        },
        Media: true, // Fully populate Media
      },
    });

    // Debugging: Log after fetching related data
    console.log("Populated Random Item:", randomItem);

    // Build media payload
    const media = randomItem.Media
      ? {
          id: randomItem.Media.id || null,
          url: randomItem.Media.url || null,
          name: randomItem.Media.name || null,
          width: randomItem.Media.width || null,
          height: randomItem.Media.height || null,
        }
      : null;

    // Build feed payload
    const payload = {
      Titre: randomItem.Titre || null,
      Text: randomItem.Text || null,
      Credits: randomItem.Credits || null,
      Media: media,
      SousTitre: randomItem.SousTitre || null,
      Type: randomItem.Type?.Name || null, // Safely access Type name
      Immediat: randomItem.Immediat || false,
    };

    // Add to feed
    await strapi.db.query("api::feed.feed").create({
      data: {
        type: "feed-post",
        elementId: randomItem.id, // Reference to feed-post
        payload,
      },
    });

    console.log("Feed item added:", {
      type: "feed-post",
      elementId: randomItem.id,
      payload,
    });
  } catch (error) {
    console.error("Error adding item to feed:", error);
  }
}
