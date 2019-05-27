class FastifyRoute
{
    constructor(instance, config)
    {
        if (!config)
        {
            this.config = {
                method: 'GET',
                url: '/'
            };
        }
        else
        {
            this.config = config;
        }

        this.config.logLevel = 'info';

        this.instance = instance;
    }

    handler(request, reply)
    {
        reply.code(200).send('ok');
    }
}

module.exports = FastifyRoute;