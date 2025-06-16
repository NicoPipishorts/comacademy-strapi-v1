const TABLES = [
  {
    name: "api::citation.citation",
    returnFields: ["AUTEUR", "CITATION"],
  },
  {
    name: "api::commandement.commandement",
    filterField: "Active",
    returnFields: [
      "Theme",
      "Astuce_1",
      "Astuce_2",
      "Astuce_3",
      "Astuce_4",
      "Astuce_5",
      "Astuce_6",
      "Astuce_7",
      "Astuce_8",
      "Astuce_9",
      "Astuce_10",
    ],
    trueValue: true,
  },
  {
    name: "api::dico.dico",
    filterField: "isActive",
    returnFields: ["Word", "Definition"],
    trueValue: true,
  },
  {
    name: "api::metier.metier",
    returnFields: [
      "METIER",
      "ROLE_MISSIONS",
      "PORTRAIT_CHINOIS",
      "VERBATIM",
      "CATEGORIE",
    ],
  },
  {
    name: "api::question.question",
    returnFields: ["QUESTION", "COEF", "CATEGORIE"],
  },
  {
    name: "api::secret.secret",
    filterField: "Active",
    returnFields: ["Title", "Brand", "Key1", "Key2", "Key3"],
    trueValue: true,
  },
  {
    name: "api::feed-post.feed-post",
    returnFields: [
      "Type",
      "Media",
      "Titre",
      "Text",
      "Soustitre",
      "Immediat",
      "Credits",
    ],
    filterField: "Immediat",
    trueValue: false,
  },
];

module.exports = {
  // Individual tasks for each table.
  commandementFeedTask: async ({ strapi }) => {
    const table = TABLES.find(
      (t) => t.name === "api::commandement.commandement"
    );
    if (table) await createFeedItemForTable(strapi, table);
  },

  metierFeedTask: async ({ strapi }) => {
    const table = TABLES.find((t) => t.name === "api::metier.metier");
    if (table) await createFeedItemForTable(strapi, table);
  },

  questionFeedTask: async ({ strapi }) => {
    const table = TABLES.find((t) => t.name === "api::question.question");
    if (table) await createFeedItemForTable(strapi, table);
  },

  secretFeedTask: async ({ strapi }) => {
    const table = TABLES.find((t) => t.name === "api::secret.secret");
    if (table) await createFeedItemForTable(strapi, table);
  },

  feedPostFeedTask: async ({ strapi }) => {
    const table = TABLES.find((t) => t.name === "api::feed-post.feed-post");
    if (table) await createFeedItemForTable(strapi, table);
  },

  // Optionally, a default task that picks up any remaining tables not explicitly handled.
  defaultFeedTask: async ({ strapi }) => {
    const handledTables = [
      "api::commandement.commandement",
      "api::metier.metier",
      "api::question.question",
      "api::secret.secret",
      "api::feed-post.feed-post",
    ];
    const remainingTables = TABLES.filter(
      (t) => !handledTables.includes(t.name)
    );
    for (const table of remainingTables) {
      await createFeedItemForTable(strapi, table);
    }
  },

  // Deprecated: randomFeedTask is now split into individual tasks.
  randomFeedTask: async ({ strapi }) => {
    console.log(
      "randomFeedTask is deprecated. Use individual tasks (or scheduleRandomFeedTask) instead."
    );
  },

  // Scheduler that randomly selects one of the individual feed tasks.
  scheduleRandomFeedTask: async ({ strapi }) => {
    const scheduleTask = async () => {
      try {
        const tasks = [
          module.exports.commandementFeedTask,
          module.exports.metierFeedTask,
          module.exports.questionFeedTask,
          module.exports.secretFeedTask,
          module.exports.feedPostFeedTask,
          // Uncomment next line if you wish to include any remaining tables:
          // module.exports.defaultFeedTask,
        ];
        const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
        await randomTask({ strapi });
        const randomDelay =
          Math.floor(Math.random() * (240 - 180 + 1) + 180) * 60 * 1000;
        console.log(
          `Random feed task completed. Next task will run in ${
            randomDelay / 60000
          } minutes.`
        );
        setTimeout(scheduleTask, randomDelay);
      } catch (error) {
        console.error("Error scheduling the random feed task:", error);
      }
    };
    await scheduleTask();
  },

  scheduleActusBrefTask: async ({ strapi }) => {
    try {
      console.log("Executing ActusBref feed task...");

      const feedRepository = strapi.query("api::feed.feed");

      // Fetch all feed entries that were previously added
      const existingFeedEntries = await feedRepository.findMany({
        select: ["elementId"],
        where: { type: "actusBref" },
      });
      const existingIds = existingFeedEntries.map((feed) => feed.elementId);

      // Fetch the oldest published feedPost entry of type "actusBref"
      const actusBrefPost = await strapi.db
        .query("api::feed-post.feed-post")
        .findMany({
          where: {
            Type: { Name: "actusBref" },
            publishedAt: { $notNull: true },
            id: { $notIn: existingIds },
          },
          orderBy: { createdAt: "asc" },
          limit: 1,
          populate: { Media: true },
        });

      if (!actusBrefPost.length) {
        console.log("No available actusBref posts to add.");
        return;
      }

      const selectedPost = actusBrefPost[0];
      const media = selectedPost.Media
        ? {
            id: selectedPost.Media.id || null,
            url: selectedPost.Media.url || null,
            name: selectedPost.Media.name || null,
            width: selectedPost.Media.width || null,
            height: selectedPost.Media.height || null,
          }
        : null;

      // Create the payload
      const payload = {
        Titre: selectedPost.Titre || null,
        Text: selectedPost.Text || null,
        Credits: selectedPost.Credits || null,
        Media: media,
        SousTitre: selectedPost.SousTitre || null,
        Type: "actusBref",
        Immediat: selectedPost.Immediat || false,
      };

      // Insert the selected post into the feed table
      await feedRepository.create({
        data: {
          type: "actusBref",
          elementId: selectedPost.id,
          payload,
        },
      });

      console.log("ActusBref post added to feed:", {
        elementId: selectedPost.id,
        payload,
      });
    } catch (error) {
      console.error("Error running ActusBref feed task:", error);
    }
  },

  citationCron: {
    task: async ({ strapi }) => {
      try {
        // Fetch all citations where VISIBLE is false
        const citations = await strapi.entityService.findMany(
          "api::citation.citation",
          { filters: { VISIBLE: false } }
        );
        if (citations.length > 0) {
          // Pick a random citation
          const randomCitation =
            citations[Math.floor(Math.random() * citations.length)];
          // Update the selected citation to set VISIBLE to true
          await strapi.entityService.update(
            "api::citation.citation",
            randomCitation.id,
            { data: { VISIBLE: true } }
          );
          console.log(
            `Updated citation with id ${randomCitation.id} to VISIBLE: true`
          );
        } else {
          console.log("No citations found with VISIBLE set to false.");
        }
      } catch (error) {
        console.error("Error updating citation visibility:", error);
      }
    },
    options: {
      rule: "0 2 * * *", // Every day at 2:00 AM
      timezone: "Europe/Paris",
    },
  },

  dicoCron: {
    task: async ({ strapi }) => {
      try {
        // Fetch all words where aLaUne is false
        const words = await strapi.entityService.findMany("api::dico.dico", {
          filters: { aLaUne: false },
        });
        if (words.length > 0) {
          // Pick a random word
          const randomWord = words[Math.floor(Math.random() * words.length)];
          // Update the selected word to set aLaUne to true
          await strapi.entityService.update("api::dico.dico", randomWord.id, {
            data: { aLaUne: true },
          });
          console.log(`Updated word with id ${randomWord.id} to aLaUne: true`);
        } else {
          console.log("No words found with aLaUne set to false.");
        }
      } catch (error) {
        console.error("Error updating word aLaUne:", error);
      }
    },
    options: {
      rule: "30 14 * * *", // Every day at 14:30
      timezone: "Europe/Paris",
    },
  },
};

/**
 * Shared function that encapsulates the logic for creating a feed item for a given table.
 */
async function createFeedItemForTable(strapi, selectedTable) {
  try {
    console.log(`Executing feed task for table: ${selectedTable.name}`);
    const feedRepository = strapi.query("api::feed.feed");

    // Fetch recent feed entries to check the last used feed type.
    const recentFeed = await feedRepository.findMany({
      select: ["type"],
      orderBy: { createdAt: "desc" },
      limit: 50,
    });
    const lastFeedType = recentFeed[0]?.type || null;
    const tableShortName = selectedTable.name.split(".").pop();

    // Skip this table if it was used last (to promote variety)
    if (lastFeedType === tableShortName) {
      console.log(
        `Skipping task for ${selectedTable.name} as it was used last.`
      );
      return;
    }

    // Prepare common query configuration.
    const commonWhere = { publishedAt: { $notNull: true } };
    const populateConfig =
      selectedTable.name === "api::feed-post.feed-post"
        ? {
            populate: {
              Type: { fields: ["Name"] },
              Media: { fields: ["id", "url", "name", "width", "height"] },
            },
          }
        : {};

    // Fetch all published items for the selected table.
    let allItems;
    if (selectedTable.filterField) {
      allItems = await strapi.db.query(selectedTable.name).findMany({
        where: {
          [selectedTable.filterField]: selectedTable.trueValue,
          ...commonWhere,
        },
        ...populateConfig,
      });
    } else {
      allItems = await strapi.db.query(selectedTable.name).findMany({
        where: commonWhere,
        ...populateConfig,
      });
    }

    console.log(`Fetched ${allItems.length} items from ${selectedTable.name}`);
    if (!allItems.length) {
      console.log(`No available items in ${selectedTable.name}.`);
      return;
    }

    // Retrieve feed entries already posted for this type.
    const existingFeed = await feedRepository.findMany({
      select:
        selectedTable.name === "api::feed-post.feed-post"
          ? ["elementId", "type", "payload"]
          : ["elementId", "type"],
      where: { type: tableShortName },
    });
    const existingIds = existingFeed.map((feed) => feed.elementId);
    console.log(
      `Existing feed items of type ${tableShortName}: ${existingIds.length}`
    );

    // Filter to get new (unused) items; if none, fallback to reuse.
    let availableItems = allItems.filter(
      (item) => !existingIds.includes(item.id)
    );
    console.log(`Available items after filtering: ${availableItems.length}`);
    if (!availableItems.length) {
      console.log(
        `No new items available in ${selectedTable.name}, reusing an existing one.`
      );
      availableItems = allItems;
    }

    // Pick a random item.
    const randomItem =
      availableItems[Math.floor(Math.random() * availableItems.length)];

    // Build payload based on table-specific logic.
    let payload = null;
    if (selectedTable.name === "api::commandement.commandement") {
      const astuceKeys = selectedTable.returnFields.filter((f) =>
        f.startsWith("Astuce_")
      );
      const nonEmptyAstuces = astuceKeys.filter(
        (key) => randomItem[key] && randomItem[key].trim() !== ""
      );
      if (!nonEmptyAstuces.length) {
        console.log("No valid astuce found for this commandement.");
        return;
      }
      const chosenAstuce =
        nonEmptyAstuces[Math.floor(Math.random() * nonEmptyAstuces.length)];
      payload = {
        Theme: randomItem.Theme,
        Astuce: randomItem[chosenAstuce],
        index: chosenAstuce.replace("Astuce_", ""),
      };
    } else if (selectedTable.name === "api::secret.secret") {
      const keys = ["Key1", "Key2", "Key3"];
      const nonEmptyKeys = keys.filter((k) => randomItem[k]);
      if (!nonEmptyKeys.length) {
        console.log("No valid key found for this secret.");
        return;
      }
      const chosenKey =
        nonEmptyKeys[Math.floor(Math.random() * nonEmptyKeys.length)];
      payload = {
        Title: randomItem.Title,
        Brand: randomItem.Brand,
        Key: randomItem[chosenKey],
        index: chosenKey.replace("Key", ""),
      };
    } else if (selectedTable.name === "api::metier.metier") {
      const fields = ["PORTRAIT_CHINOIS", "NOTRE_AVIS", "VERBATIM"];
      const chosenField = fields[Math.floor(Math.random() * fields.length)];
      payload = {
        METIER: randomItem.METIER,
        THEME: chosenField,
        CONTENT: randomItem[chosenField] || null,
        CATEGORIE: randomItem.CATEGORIE || null,
      };
    } else if (selectedTable.name === "api::question.question") {
      payload = {
        QUESTION: randomItem.QUESTION || "N/A",
        COEF: randomItem.COEF !== undefined ? randomItem.COEF : null,
        CATEGORIE: randomItem.CATEGORIE || "Uncategorized",
      };
    } else if (selectedTable.name === "api::feed-post.feed-post") {
      const typeData = randomItem.Type;
      let typeName = null;
      if (typeData) {
        typeName =
          typeData.data && typeData.data.attributes
            ? typeData.data.attributes.Name
            : typeData.Name;
      }
      // Prevent duplicate posts for specific types.
      if (["marqueMystere", "petitesHistoires"].includes(typeName)) {
        const duplicate = existingFeed.some(
          (feed) => feed.payload?.Type === typeName
        );
        if (duplicate) {
          console.log(
            `Skipping reposting of ${typeName} as another entry exists.`
          );
          return;
        }
      }
      const media = randomItem.Media
        ? {
            id: randomItem.Media.id,
            url: randomItem.Media.url,
            name: randomItem.Media.name,
            width: randomItem.Media.width,
            height: randomItem.Media.height,
          }
        : null;
      payload = {
        Titre: randomItem.Titre || null,
        Text: randomItem.Text || null,
        Credits: randomItem.Credits || null,
        Media: media,
        SousTitre: randomItem.Soustitre || null,
        Type: typeName,
        Immediat:
          typeof randomItem.Immediat !== "undefined"
            ? randomItem.Immediat
            : false,
      };
    } else {
      // Default payload handling.
      payload = {};
      selectedTable.returnFields.forEach((field) => {
        payload[field] = randomItem[field] || null;
      });
    }

    if (!payload) {
      console.log("Payload creation failed.");
      return;
    }
    console.log("Payload prepared:", payload);

    // Insert the new feed item.
    try {
      const newFeed = await feedRepository.create({
        data: {
          type: tableShortName,
          elementId: randomItem.id,
          payload,
        },
      });
      console.log("Successfully added feed item:", newFeed);
    } catch (error) {
      console.error("Error inserting new feed item:", error);
    }
  } catch (error) {
    console.error(`Error in feed task for ${selectedTable.name}:`, error);
  }
}
