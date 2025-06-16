"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::playlist.playlist",
  ({ strapi }) => ({
    async deletePlaylist(ctx) {
      const { id } = ctx.params;

      if (!id) {
        return ctx.badRequest("Playlist ID is required");
      }

      try {
        // Fetch the playlist contents
        const playlist = await strapi.entityService.findOne(
          "api::playlist.playlist",
          id,
          {
            populate: ["playlist_contents"],
          }
        );

        if (!playlist) {
          return ctx.notFound("Playlist not found");
        }

        const itemIds = playlist.playlist_contents.map((item) => item.id);

        // Remove items from playlist-content table
        if (itemIds.length > 0) {
          await strapi.db
            .query("api::playlist-content.playlist-content")
            .deleteMany({
              where: {
                id: { $in: itemIds },
              },
            });
        }

        // Remove the playlist
        await strapi.entityService.delete("api::playlist.playlist", id);

        return ctx.send({
          message: "Playlist and its contents deleted successfully",
        });
      } catch (error) {
        strapi.log.error("Error deleting playlist:", error);
        return ctx.internalServerError("Unable to delete playlist");
      }
    },

    async checkElementInPlaylists(ctx) {
      const { userId, type, elementId } = ctx.params;

      // Validate input
      if (!userId || !type || !elementId) {
        return ctx.badRequest("User ID, type, and Element ID are required");
      }

      // Ensure `type` is valid
      const validTypes = ["question", "dico", "metier"];
      if (!validTypes.includes(type)) {
        return ctx.badRequest(
          `Invalid type. Expected one of: ${validTypes.join(", ")}`
        );
      }

      try {
        // Convert elementId to a number for proper comparison
        const parsedElementId = parseInt(elementId, 10);

        // Fetch playlists filtered by userId
        const playlists = await strapi.entityService.findMany(
          "api::playlist.playlist",
          {
            filters: {
              userId: { id: userId },
            },
            populate: {
              playlist_contents: {
                populate: [type], // Dynamically populate only the specified field
              },
            },
          }
        );

        // Enrich playlists with `inPlaylist` key
        const enrichedPlaylists = playlists.map((playlist) => {
          const inPlaylist = playlist.playlist_contents.some((content) => {
            return content[type]?.id === parsedElementId;
          });

          // Return only necessary fields
          const { id, name, createdAt, updatedAt, publishedAt, selectedColor } =
            playlist;

          return {
            id,
            attributes: {
              name,
              createdAt,
              updatedAt,
              publishedAt,
              selectedColor,
              inPlaylist,
            },
          };
        });

        // Prepare response
        return ctx.send({
          data: enrichedPlaylists,
          meta: {
            pagination: {
              page: 1,
              pageSize: enrichedPlaylists.length,
              pageCount: 1,
              total: enrichedPlaylists.length,
            },
          },
        });
      } catch (error) {
        strapi.log.error("Error checking element in playlists:", error);
        return ctx.internalServerError("Unable to check element in playlists");
      }
    },
  })
);
