const program = require('commander');
const fs = require('fs');
const path = require('path');

const fastify = require('fastify')({
    logger: false
});

const app = {
    log: require('./framework/logging/log'),
    config: require('./config/server'),
    siteAccess: require('./config/access.json'),
    meta: require('./package'),
    port: process.env.PORT || 3000,

    utils: {
        processRouteHandler: (p) =>
        {
            app.log.info(`Trying to register router from '${p}'`);
            const m = require(p);
            const route = new m();
            app.log.info(`Registering ${route.config.url} for ${route.config.method}`);

            const options = route.config;
            options.handler = route.handler;

            fastify.route(options);
        },

        parseRouteStore: (path_routes) =>
        {
            return new Promise((parse_resolve, parse_reject) =>
            {
                fs.readdir(path_routes, {withFileTypes: true}, async (err, files) =>
                {
                    if (err)
                    {
                        return parse_reject(err);
                    }

                    //walk through all the items in the path sepcified
                    for (const file of files)
                    {
                        //build the absolute path
                        const p = path.join(path_routes, file.name);
                        if (file.isDirectory())
                        {
                            //if directory, we run the parser for all the items within the directory
                            await app.utils.parseRouteStore(p);
                        }
                        else if (file.isFile())
                        {
                            //process router
                            app.utils.processRouteHandler(p);
                        }
                    }

                    return parse_resolve(files);
                });
            });
        },

        loadRouteHandlers: () =>
        {
            return new Promise(async (resolve, reject) =>
            {
                const path_routes = path.join(__dirname, '/routes/');
                if (!fs.existsSync(path_routes))
                {
                    fs.mkdir(path_routes);
                }

                await app.utils.parseRouteStore(path_routes);

                resolve();
            });
        }
    },

    init: async () =>
    {
        process.title = `${app.meta.name} on port ${app.port}`;

        program
            .version(`${app.meta.version}`, '-v, --version')
            .usage('-port -path')
            .option('-p, --port <port>', 'port')
            .parse(process.argv);

        if (!program.port)
        {
            app.log.info(`Port is not set, will be using ${app.port} as default`);
        }
        else
        {
            app.port = program.port;
        }

        //if specified, allow serving static content
        if (app.config.static && app.config.static.root)
        {
            fastify.register(require('fastify-static'), {
                root: path.join(__dirname, app.config.static.root)
            });
        }

        //enable view engine
        if (app.config.viewEngine)
        {
            switch (app.config.viewEngine.engine.toLowerCase())
            {
                case 'handlebars':
                    fastify.render = (template, data) =>
                    {
                        const hbs = require('handlebars');
                        //register partials
                        hbs.registerPartial({
                            applicationName: app.meta.name
                        });

                        //render whole thing
                        try
                        {
                            const ctx = hbs.compile(template, app.config.viewEngine.config);
                            return ctx(data);
                        } catch (e)
                        {
                            app.log.error(e.message);
                            return {error: {message: e.message}};
                        }

                    };
                    break;

                default:
                    app.log.warn(`View engine ${app.config.viewEngine.engine} is not supported`);
                    break;
            }
        }

        //handle 'not found' requests
        fastify.register(async (instance, options, next) =>
        {
            instance.setNotFoundHandler((req, res) =>
            {
                res.send({error: {message: 'Resource not found', url: req.raw.url}});
            });

            next();
        });

        await app.utils.loadRouteHandlers();
        app.log.info('Route handlers has been loaded');

        fastify.ready().then(() =>
        {
            app.log.info('successfully booted!');
            app.log.info(`Routes:\n${fastify.printRoutes()}`);
        }, (err) =>
        {
            console.log('ready() error:');
            console.log(err);
        });

        try
        {
            await fastify.listen(app.port);
            app.log.info(`server listening on ${fastify.server.address().port}`);

        } catch (err)
        {
            fastify.log.error(err);
            process.exit(1);
        }
    }
};

app.init();