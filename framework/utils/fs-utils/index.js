const fs = require('fs');
const path = require('path');

const processAppRoot = process.mainModule.paths[0].split('node_modules')[0].slice(0, -1);

module.exports = {
    exist: filepath =>
    {
        if (filepath.indexOf('~') === 0)
        {
            filepath = filepath.replace('~', '');
            filepath = path.join(processAppRoot, filepath);
        }

        return fs.existsSync(filepath);
    },
    readFile: filepath =>
    {
        if (filepath.indexOf('~') === 0)
        {
            filepath = filepath.replace('~', '');
            filepath = path.join(processAppRoot, filepath);
        }

        if (!fs.existsSync(filepath))
        {
            return undefined;
        }

        return fs.readFileSync(filepath, 'utf8');
    }
};