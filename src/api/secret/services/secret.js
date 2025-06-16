'use strict';

/**
 * secret service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::secret.secret');
