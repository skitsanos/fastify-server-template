/**
 * @author skitsanos
 * Fastify Server Template - Main Application
 */

const {program} = require('commander');
const serverConfig = require('./config/server.json');
const {bootstrap} = require('./core/bootstrap');

// Application core
const app = {
    meta: require('../package'),
    port: process.env.PORT || 8000,

    init: async () => {
        // Set process title
        process.title = `${app.meta.name} on port ${app.port}`;

        // Parse command line arguments
        program
            .version(app.meta.version)
            .option('-p, --port <port>', 'port')
            .parse(process.argv);

        if (program.port) {
            app.port = program.port;
        }

        // Bootstrap the application
        const fastify = await bootstrap(app.meta, serverConfig, app.port);

        // Start the server
        try {
            await fastify.listen({
                port: app.port,
                host: serverConfig.host || '0.0.0.0'
            });
            fastify.log.info(`Server listening on ${fastify.server.address().port}`);
        } catch (err) {
            fastify.log.error(err);
            process.exit(1);
        }

        // Log successful boot
        fastify.ready().then(() => {
            fastify.log.info('Successfully booted!');
        }, err => {
            fastify.log.error(`ready() error: ${err.message}`);
        });
    }
};

// Initialize the application
app.init();
