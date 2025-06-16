'use strict';

/**
 * favorite-question service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::favorite-question.favorite-question');
