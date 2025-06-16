'use strict';

/**
 * game-question service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::game-question.game-question');
