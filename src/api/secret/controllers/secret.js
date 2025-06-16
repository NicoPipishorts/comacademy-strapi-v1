'use strict';

/**
 * secret controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::secret.secret');
