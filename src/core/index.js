/**
 * @author skitsanos
 * Core modules exports
 */

const {createServer} = require('./server');
const {timestamp, setupLogging} = require('./logging');
const {
    registerPlugins,
    setupStaticContent,
    setupCookies,
    setupViewEngine,
    setupCors,
    setupParsers
} = require('./plugins');
const {setupErrorHandlers} = require('./errorHandlers');
const {setupSecurityHooks} = require('./security');
const {loadSchemasAndRoutes} = require('./loader');
const {bootstrap} = require('./bootstrap');

module.exports = {
    createServer,
    timestamp,
    setupLogging,
    registerPlugins,
    setupStaticContent,
    setupCookies,
    setupViewEngine,
    setupCors,
    setupParsers,
    setupErrorHandlers,
    setupSecurityHooks,
    loadSchemasAndRoutes,
    bootstrap
};
