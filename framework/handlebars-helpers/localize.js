const path = require('path');
const fs = require('fs');

module.exports = {
    localize: (value, options) =>
    {
        if (value.hash.lang && value.hash.key)
        {
            const processAppRoot = process.mainModule.paths[0].split('node_modules')[0].slice(0, -1);
            const localizeConfigPath = path.join(processAppRoot, '/config/localize.json');

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