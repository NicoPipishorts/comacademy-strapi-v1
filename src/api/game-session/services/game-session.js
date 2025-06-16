'use strict';

/**
 * game-session service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::game-session.game-session');
