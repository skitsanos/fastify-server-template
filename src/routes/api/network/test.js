const Route = require(process.cwd() + '/src/framework/fastify/route');

class Test extends Route
{
    constructor(instance)
    {
        const config = {
            method: ['GET', 'POST', 'PUT'],
            url: '/test',
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

module.exports = Test;