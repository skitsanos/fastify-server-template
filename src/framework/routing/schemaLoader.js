/**
 * @author skitsanos
 * Enhanced Schema loader for Fastify
 */

const fs = require('fs');
const path = require('path');
const fsutils = require('../utils/fs-utils');
const ExecutionTime = require('../utils/execTime');

class SchemaLoader {
    constructor(fastify, options = {}) {
        this.fastify = fastify;
        this.options = options;
        this.log = options.log || fastify.log;
        this.schemasDir = options.schemasDir || path.join(process.cwd(), 'src/schemas');
        this.schemas = []; // Track loaded schemas
    }

    /**
     * Register a schema with Fastify
     * @param {string} schemaPath - Path to the schema file
     * @param {string} schemaName - Name of the schema file
     */
    registerSchema(schemaPath, schemaName) {
        try {
            const timer = new ExecutionTime();
            
            // Read and parse the schema file
            let schemaContent = fsutils.readFile(schemaPath);
            if (!schemaContent) {
                this.log.warn(`Failed to read schema file: ${schemaName}`);
                return;
            }
            
            let parsedSchema;
            try {
                parsedSchema = JSON.parse(schemaContent);
            } catch (parseErr) {
                this.log.error(`Failed to parse schema ${schemaName}: ${parseErr.message}`);
                return;
            }
            
            // Validate schema structure
            if (!parsedSchema.$id) {
                this.log.warn(`Schema ${schemaName} missing $id property, adding default`);
                parsedSchema.$id = schemaName.replace('.json', '');
            }
            
            // Register the schema with Fastify
            this.fastify.addSchema(parsedSchema);
            
            // Track the loaded schema
            this.schemas.push({
                name: schemaName,
                id: parsedSchema.$id,
                path: schemaPath
            });
            
            const duration = timer.duration();
            this.log.info(`Loaded schema: ${schemaName} (${duration}ms)`);
        } catch (err) {
            this.log.error(`Error registering schema ${schemaName}: ${err.message}`);
        }
    }

    /**
     * Register a schema with specialized versioning support
     * @param {string} schemaPath - Path to the schema file
     * @param {string} schemaName - Name of the schema file
     * @param {string|null} version - API version if present
     */
    registerVersionedSchema(schemaPath, schemaName, version) {
        try {
            // Skip if no version is specified
            if (!version) {
                this.registerSchema(schemaPath, schemaName);
                return;
            }
            
            const timer = new ExecutionTime();
            
            // Read and parse the schema file
            let schemaContent = fsutils.readFile(schemaPath);
            if (!schemaContent) {
                this.log.warn(`Failed to read schema file: ${schemaName}`);
                return;
            }
            
            let parsedSchema;
            try {
                parsedSchema = JSON.parse(schemaContent);
            } catch (parseErr) {
                this.log.error(`Failed to parse schema ${schemaName}: ${parseErr.message}`);
                return;
            }
            
            // Ensure schema has an ID
            if (!parsedSchema.$id) {
                parsedSchema.$id = schemaName.replace('.json', '');
            }
            
            // Add version prefix to schema ID if not already present
            if (!parsedSchema.$id.startsWith(version)) {
                parsedSchema.$id = `${version}-${parsedSchema.$id}`;
            }
            
            // Register the schema with Fastify
            this.fastify.addSchema(parsedSchema);
            
            // Track the loaded schema
            this.schemas.push({
                name: schemaName,
                id: parsedSchema.$id,
                path: schemaPath,
                version: version
            });
            
            const duration = timer.duration();
            this.log.info(`Loaded versioned schema: ${schemaName} (${version}) in ${duration}ms`);
        } catch (err) {
            this.log.error(`Error registering versioned schema ${schemaName}: ${err.message}`);
        }
    }

    /**
     * Recursively scan directories for schema files
     * @param {string} dirPath - Directory path to scan
     * @param {string|null} version - API version if present
     */
    scanSchemaDirectory(dirPath, version = null) {
        try {
            // Check if directory exists
            if (!fs.existsSync(dirPath)) {
                this.log.warn(`Schemas directory not found: ${dirPath}`);
                return;
            }
            
            const files = fs.readdirSync(dirPath, { withFileTypes: true });
            
            for (const item of files) {
                const itemPath = path.join(dirPath, item.name);
                
                // Skip hidden files and directories
                if (item.name.startsWith('.')) {
                    continue;
                }
                
                if (item.isDirectory()) {
                    // Check if directory is a version directory
                    const versionMatch = item.name.match(/^v(\d+)$/i);
                    if (versionMatch) {
                        // Process schemas in this version directory with the version tag
                        this.scanSchemaDirectory(itemPath, item.name.toLowerCase());
                    } else {
                        // Recursively scan non-version directories with current version
                        this.scanSchemaDirectory(itemPath, version);
                    }
                } else if (item.isFile() && item.name.endsWith('.json')) {
                    // Process each JSON schema file
                    if (version) {
                        this.registerVersionedSchema(itemPath, item.name, version);
                    } else {
                        this.registerSchema(itemPath, item.name);
                    }
                }
            }
        } catch (err) {
            this.log.error(`Error scanning schema directory ${dirPath}: ${err.message}`);
        }
    }

    /**
     * Register schemas documentation endpoint if enabled
     */
    registerSchemasDocumentation() {
        // Skip if documentation is disabled
        if (this.options.documentation === false) {
            return;
        }
        
        const docPath = this.options.documentationPath || '/api/schemas';
        
        this.fastify.get(docPath, (req, reply) => {
            // Format schemas into a structured documentation response
            const docs = {
                total: this.schemas.length,
                schemas: this.schemas.map(schema => ({
                    name: schema.name,
                    id: schema.id,
                    version: schema.version || 'default'
                }))
            };
            
            reply.send({ result: docs });
        });
        
        this.log.info(`Schemas documentation registered at ${docPath}`);
    }

    /**
     * Load all JSON schemas from the schemas directory
     */
    loadSchemas() {
        try {
            const timer = new ExecutionTime();
            
            // Scan and load schemas
            this.scanSchemaDirectory(this.schemasDir);
            
            // Register documentation endpoint
            this.registerSchemasDocumentation();
            
            const duration = timer.duration();
            this.log.info(`Loaded ${this.schemas.length} schemas in ${duration}ms`);
        } catch (err) {
            this.log.error(`Error loading schemas: ${err.message}`);
        }
    }

    /**
     * Get list of registered schemas
     * @returns {Array} Array of registered schemas
     */
    getSchemas() {
        return this.schemas;
    }
}

module.exports = SchemaLoader;