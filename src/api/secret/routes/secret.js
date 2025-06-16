'use strict';

/**
 * secret router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::secret.secret');
