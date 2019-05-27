const fs = require('fs');
const Transport = require('winston-transport');

class FileTransport extends Transport
{
    constructor(opts)
    {
        super(opts);
    }

    log(info, callback)
    {
        fs.appendFile(process.cwd() + '/app.log', `${info.level} ${info.message}\n`, (err) =>
        {
            if (err)
            {
                console.log(err.message);
            }
        });
        callback();
    }
}

module.exports = FileTransport;