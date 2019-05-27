const Route = require(process.cwd() + '/framework/fastify/route');

class Echo extends Route
{
    constructor(instance)
    {
        const config = {
            method: 'GET',
            url: '/test-render'
        };
        super(instance, config);
    }

    handler(req, res)
    {
        const html = this.render('Hello, {{name}}!', {
            name: 'Awesome you are'
        });
        res.send(html);
    }
}

module.exports = Echo;