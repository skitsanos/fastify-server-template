/**
 * @author skitsanos
 * Security-related configuration and hooks
 */

/**
 * Setup security hooks
 * @param {Object} fastify - Fastify instance
 * @param {Object} meta - Application metadata
 * @param {boolean} upgradeInsecureRequests - Whether to upgrade insecure requests
 */
const setupSecurityHooks = (fastify, meta, upgradeInsecureRequests) => {
    fastify.addHook('onRequest', (req, res, next) => {
        // Set server identification
        res.header('server', `${meta.name} ${meta.version}`);

        // Handle upgrade-insecure-requests
        if (Number(req.headers['upgrade-insecure-requests']) === 1 && upgradeInsecureRequests) {
            const secureUrl = `https://${req.hostname}${req.raw.url}`;
            res.header('Vary', 'Upgrade-Insecure-Requests');
            res.redirect(302, secureUrl);
        }

        // Set security headers
        res.header('x-powered-by', meta.name);
        res.header('X-Content-Type-Options', 'nosniff');
        res.header('X-DNS-Prefetch-Control', 'off');
        res.header('X-Frame-Options', 'DENY');

        next();
    });
};

module.exports = {
    setupSecurityHooks
};
