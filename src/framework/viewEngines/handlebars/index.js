/**
 * @author skitsanos
 * Handlebars view engine integration for Fastify
 */

const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

class HandlebarsViewEngine {
    constructor(fastify, options) {
        this.fastify = fastify;
        this.options = options;
        this.meta = options.meta;
        this.log = options.log || fastify.log;
        this.partials = {};
        
        this.loadPartials();
        this.setupHelpers();
    }

    loadPartials() {
        const partialsDir = path.join(process.cwd(), this.options.partialsDir || 'ui/partials');
        
        if (fs.existsSync(partialsDir)) {
            const files = fs.readdirSync(partialsDir, { withFileTypes: true });

            for (const partial of files) {
                if (partial.isFile()) {
                    const partialName = path.parse(partial.name).name;
                    this.log.info(`Found partial: ${partialName}`);
                    this.partials[partialName] = fs.readFileSync(path.join(partialsDir, partial.name)).toString();
                }
            }
        }
    }

    setupHelpers() {
        // Register application metadata as helpers
        handlebars.registerPartial({
            applicationName: this.meta.name,
            applicationVersion: this.meta.version
        });

        // Register partials
        handlebars.registerPartial(this.partials);

        // Register helpers
        handlebars.registerHelper({
            applicationName: this.meta.name,
            applicationVersion: this.meta.version
        });

        // Load framework helpers
        const helpersPath = path.join(process.cwd(), '/src/framework/handlebars-helpers');
        if (fs.existsSync(helpersPath)) {
            const helpersFiles = fs.readdirSync(helpersPath, { withFileTypes: true });
            for (const helperFile of helpersFiles) {
                handlebars.registerHelper(require(path.join(helpersPath, helperFile.name)));
            }
        }
    }

    render(template, data) {
        try {
            let ctx;

            switch (typeof template) {
                case 'string':
                    ctx = handlebars.compile(template, this.options.config);
                    break;

                case 'object':
                    const templatesDir = this.options.templatesDir || 'ui';
                    const filePath = path.join(process.cwd(), path.join(templatesDir, template.file));

                    if (!fs.existsSync(filePath)) {
                        return new Error(`Template ${template.file} is not found`);
                    }

                    try {
                        const templateContent = fs.readFileSync(filePath);
                        ctx = handlebars.compile(templateContent.toString(), this.options.config);
                    } catch (e) {
                        return e;
                    }
                    break;

                default:
                    return new Error(`Template ${template.file} type is unknown`);
            }

            if (ctx) {
                return ctx(data);
            }
        } catch (e) {
            this.log.error(e.message);
            return { error: { message: e.message } };
        }

        return new Error(`Template ${template.file} failed to be rendered`);
    }
}

module.exports = HandlebarsViewEngine;