const Route = require(process.cwd() + '/framework/fastify/route');
const meta = require('~package');

class VersionRoute extends Route
{
    constructor(instance)
    {
        const config = {
            method: 'GET',
            url: '/version',
            bodyLimit: 512
        };
        super(instance, config);
    }

    handler(req, res)
    {
        res.send({
            result: {
                name: meta.name,
                version: meta.version
            }
        });
    }
}

module.exports = VersionRoute;