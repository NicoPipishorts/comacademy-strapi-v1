'use strict';

/**
 * commandement service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::commandement.commandement');
