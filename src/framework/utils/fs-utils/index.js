/**
 * @author skitsanos
 * File system utility functions
 */

const fs = require('fs');
const path = require('path');

// Use require.main.path instead of process.mainModule.paths which is deprecated
const appRoot = require.main ? path.dirname(require.main.filename) : process.cwd();

module.exports = {
    /**
     * Check if a file exists
     * @param {string} filepath - Path to the file
     * @returns {boolean} - True if the file exists, false otherwise
     */
    exist: filepath => {
        // Handle legacy path with tilde
        if (filepath.startsWith('~')) {
            filepath = filepath.replace('~', '');
            filepath = path.join(appRoot, filepath);
        }

        return fs.existsSync(filepath);
    },
    
    /**
     * Read a file and return its contents
     * @param {string} filepath - Path to the file
     * @returns {string|undefined} - File contents as string or undefined if file doesn't exist
     */
    readFile: filepath => {
        // Handle legacy path with tilde
        if (filepath.startsWith('~')) {
            filepath = filepath.replace('~', '');
            filepath = path.join(appRoot, filepath);
        }

        if (!fs.existsSync(filepath)) {
            return undefined;
        }

        return fs.readFileSync(filepath, 'utf8');
    }
};