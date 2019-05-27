const Route = require(process.cwd() + '/framework/fastify/route');

class Echo extends Route
{
    constructor(instance)
    {
        const config = {
            method: ['GET', 'POST', 'PUT'],
            url: '/echo',
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