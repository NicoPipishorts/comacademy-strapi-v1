"use strict";

/**
 * playlist service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::playlist.playlist", ({ strapi }) => ({
  async findPlaylistsByUser(userId) {
    try {
      const playlists = await strapi.entityService.findMany(
        "api::playlist.playlist",
        {
          filters: { user: userId }, // Ensure user field matches your schema
          populate: ["playlist_contents"], // Populate playlist_contents field
        }
      );

      return playlists.map((playlist) => ({
        id: playlist.id,
        attributes: playlist.attributes,
        playlist_contents: playlist.playlist_contents,
      }));
    } catch (error) {
      strapi.log.error("Error fetching playlists by user:", error);
      throw new Error("Unable to fetch playlists by user");
    }
  },
}));
