'use strict';

/**
 * feed-post service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::feed-post.feed-post');
