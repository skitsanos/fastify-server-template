const Route = require(process.cwd() + '/src/framework/fastify/route');

class Echo extends Route
{
    constructor(instance)
    {
        const config = {
            method: ['GET', 'POST', 'PUT'],
            url: '/echo',
            alias: '/talkback',
            bodyLimit: 512
        };
        super(instance, config);
    }

    handler(req, res)
    {
        res.send({
            result: {
                url: req.raw.url
            }
        });
    }
}

module.exports = Echo;