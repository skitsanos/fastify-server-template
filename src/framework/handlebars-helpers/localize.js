const path = require('path');
const fs = require('fs');

module.exports = {
    localize: (value, options) =>
    {
        if (value.hash.lang && value.hash.key)
        {
            // Use require.main.path instead of process.mainModule.paths which is deprecated
            const appRoot = require.main ? path.dirname(require.main.filename) : process.cwd();
            const localizeConfigPath = path.join(appRoot, '/config/localize.json');

            if (!fs.existsSync(localizeConfigPath))
            {
                return `!ERR: Can't find /config/localize.json`;
            }
            else
            {
                const data = require(localizeConfigPath);
                if (!data.hasOwnProperty('strings'))
                {
                    return '!ERR: localize file has no strings section';
                }
                else
                {
                    const section = data.strings[value.hash.key];
                    if (section === undefined)
                    {
                        //if key is not defined, just return the key wrapped in pair of #
                        return `#${value.hash.key}#`;
                    }
                    else
                    {
                        //otherwise lookup for the value
                        if (!section.hasOwnProperty(value.hash.lang))
                        {
                            return `?(${value.hash.lang}) ${value.hash.key.toUpperCase()}`;
                        }

                        return section[value.hash.lang];
                    }
                }
            }
        }
        else
        {
            return '!ERR: missing arguments for localize helper';
        }
    }
};