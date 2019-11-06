const program = require('commander');
const fs = require('fs');
const path = require('path');
const fsutils = require('~framework/utils/fs-utils');
const serverConfig = require('~config/server.json');

const fastify = require('fastify')({
    logger: true,
    disableRequestLogging: !serverConfig.logging.request,
    ignoreTrailingSlash: serverConfig.strictRouting,
    maxParamLength: serverConfig.parsers.maxParamLength,
    caseSensitive: serverConfig.parsers.caseSensitive,
    bodyLimit: serverConfig.parsers.bodyLimit
});

const app = {
    log: require('~framework/logging/log'),
    meta: require('./package'),
    port: process.env.PORT || 3000,

    schemas: {},

    utils: {
        processRouteHandler: (p) =>
        {
            app.log.info(`trying '${p}'`);
            const m = require(p);
            const route = new m(fastify);
            app.log.info(`registering ${route.config.url} for ${route.config.method}`);

            //check if route has a path alias
            if (route.config.hasOwnProperty('alias'))
            {
                app.log.info(`processing aliases ${route.config.alias}...`);
                let aliasedOptions = Object.assign({}, route.config);
                aliasedOptions.handler = route.handler;

                switch (typeof route.config.alias)
                {
                    case 'string':
                        aliasedOptions.url = aliasedOptions.alias;
                        delete aliasedOptions.alias;
                        fastify.route(aliasedOptions);
                        break;

                    case 'object':
                        if (Array.isArray(aliasedOptions.alias))
                        {
                            for (const alias of aliasedOptions.alias)
                            {
                                let eachAliasOption = Object.assign({}, aliasedOptions);
                                delete eachAliasOption.alias;
                                eachAliasOption.url = alias;
                                fastify.route(eachAliasOption);
                            }
                        }

                        break;
                }
            }

            //process routes without alias
            const options = route.config;
            options.handler = route.handler;

            fastify.route(options);
        },

        parseRouteStore: (path_routes) =>
        {
            const files = fs.readdirSync(path_routes, {withFileTypes: true});

            //walk through all the items in the path sepcified
            for (const file of files)
            {
                //build the absolute path
                const p = path.join(path_routes, file.name);
                if (file.isDirectory())
                {
                    //if directory, we run the parser for all the items within the directory
                    app.utils.parseRouteStore(p);
                }
                else if (file.isFile())
                {
                    //process router
                    app.utils.processRouteHandler(p);
                }
            }
        },

        loadRouteHandlers: () =>
        {
            const path_routes = path.join(__dirname, '/routes/');
            if (!fs.existsSync(path_routes))
            {
                fs.mkdir(path_routes);
            }

            app.utils.parseRouteStore(path_routes);
        },

        loadSchemas: () =>
        {
            const schemasPath = path.join(__dirname, 'schemas');
            if (fs.existsSync(schemasPath))
            {
                const schemasList = fs.readdirSync(schemasPath, {withFileTypes: true});
                for (const schema of schemasList)
                {
                    if (schema.isFile())
                    {
                        const schemaContent = fsutils.readFile(path.join(schemasPath, schema.name));
                        fastify.addSchema(JSON.parse(schemaContent));
                    }
                }
            }
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
            app.log.info(`port is not set, will be using ${app.port} as default`);
        }
        else
        {
            app.port = program.port;
        }

        //if specified, allow serving static content
        if (serverConfig.static && serverConfig.static.root)
        {
            const staticPath = path.join(__dirname, serverConfig.static.root);
            if (fs.existsSync(staticPath))
            {
                fastify.register(require('fastify-static'), {
                    root: staticPath
                });
            }
            else
            {
                app.log.warn(`Static content path '${serverConfig.static.root}' is not found`);
            }
        }

        //cookies support
        if (serverConfig.cookies)
        {
            fastify.register(require('fastify-cookie'));
            app.log.info('cookies support: enabled');
        }

        //enable view engine
        if (serverConfig.viewEngine)
        {
            switch (serverConfig.viewEngine.engine.toLowerCase())
            {
                case 'handlebars':
                    //preload partials
                    const partialsBitsPath = serverConfig.viewEngine.partialsDir || 'ui/partials';
                    const partialsDir = path.join(__dirname, partialsBitsPath);
                    let partials = {};

                    if (fs.existsSync(partialsDir))
                    {
                        const files = fs.readdirSync(partialsDir, {withFileTypes: true});

                        for (const partial of files)
                        {
                            if (partial.isFile())
                            {
                                const partial_name = path.parse(partial.name).name;
                                app.log.info(`Found partial: ${partial_name}`);
                                partials[partial_name] = fs.readFileSync(path.join(partialsDir, partial.name)).toString();
                            }
                        }
                    }

                    fastify.render = (template, data) =>
                    {
                        const hbs = require('handlebars');
                        //register partials
                        hbs.registerPartial({
                            applicationName: app.meta.name,
                            applicationVersion: app.meta.version
                        });

                        hbs.registerPartial(partials);

                        hbs.registerHelper({
                            applicationName: app.meta.name,
                            applicationVersion: app.meta.version
                        });

                        //preload framework helpers
                        const helpers_path = path.join(__dirname, '/framework/handlebars-helpers');
                        if (fs.existsSync(helpers_path))
                        {
                            const helpers_files = fs.readdirSync(helpers_path, {withFileTypes: true});
                            for (const helper_file of helpers_files)
                            {
                                hbs.registerHelper(require(path.join(helpers_path, helper_file.name)));
                            }
                        }

                        //render whole thing
                        try
                        {
                            let ctx;

                            switch (typeof template)
                            {
                                case 'string':
                                    ctx = hbs.compile(template, serverConfig.viewEngine.config);
                                    break;

                                case 'object':
                                    const templatesDir = serverConfig.viewEngine.templatesDir || 'ui';
                                    const file_path = path.join(__dirname, path.join(templatesDir, template.file));

                                    if (!fs.existsSync(file_path))
                                    {
                                        return new Error(`Template ${template.file} is not found`);
                                    }

                                    try
                                    {
                                        const template_content = fs.readFileSync(file_path);
                                        ctx = hbs.compile(template_content.toString(), serverConfig.viewEngine.config);
                                    } catch (e)
                                    {
                                        return e;
                                    }
                                    break;
                            }

                            if (ctx)
                            {
                                return ctx(data);
                            }

                        } catch (e)
                        {
                            app.log.error(e.message);
                            return {error: {message: e.message}};
                        }
                    };
                    break;

                default:
                    app.log.warn(`view engine ${serverConfig.viewEngine.engine} is not supported`);
                    break;
            }
        }

        const corsFile = path.join(__dirname, 'config/cors.json');
        if (fs.existsSync(corsFile))
        {
            app.log.info('Processing CORS options');
            fastify.register(require('fastify-cors'), require(corsFile));
        }

        //handle 'not found' requests
        fastify.register(async (instance, options, next) =>
        {
            instance.setNotFoundHandler((req, res) =>
            {
                res.send({
                    error: {
                        message: 'Resource not found',
                        url: req.raw.url
                    }
                });
            });

            next();
        });

        fastify.setErrorHandler((error, req, res) =>
        {
            res.status(error.statusCode).send({error: {message: error.message}});
        });

        //Add accepts parser to fastify
        if (serverConfig.parsers.accepts)
        {
            fastify.register(require('fastify-accepts'));
        }

        app.utils.loadSchemas();
        app.utils.loadRouteHandlers();

        fastify.addHook('onRequest', (req, res, next) =>
        {
            res.header('server', `${app.meta.name} ${app.meta.version}`);

            if (Number(req.headers['upgrade-insecure-requests']) === 1)
            {
                //redirect to HTTPS location if requested
                if (serverConfig.upgradeInsecureRequests)
                {
                    const secureUrl = `https://${req.hostname}${req.raw.url}`;

                    res.header('Vary', 'Upgrade-Insecure-Requests');
                    res.redirect(302, secureUrl);
                }
            }

            /*
            Remove the X-Powered-By header to make it slightly harder for attackers to see what potentially-vulnerable
            technology powers your site.
             */
            res.header('x-powered-by', app.meta.name);

            /*
            Helps prevent browsers from trying to guess (“sniff”) the MIME type, which can have security implications.
             */
            res.header('X-Content-Type-Options', 'nosniff');

            /*
            The X-DNS-Prefetch-Control header tells browsers whether they should do DNS prefetching. Turning it on may
            not work—not all browsers support it in all situations—but turning it off should disable it on all
            supported browsers.
             */
            res.header('X-DNS-Prefetch-Control', 'off');

            /*
            The X-Frame-Options header tells browsers to prevent your webpage from being put in an iframe. When
            browsers load iframes, they’ll check the value of the X-Frame-Options header and abort loading
            if it’s not allowed
             */
            res.header('X-Frame-Options', 'DENY');

            next();
        });

        fastify.ready().then(() =>
        {
            app.log.info('successfully booted!');
        }, (err) =>
        {
            app.log.error('ready() error:');
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
