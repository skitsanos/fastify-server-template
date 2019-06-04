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

    handler(request, response)
    {
        return new Promise((resolve, reject) =>
        {
            if (request.validationError)
            {
                console.error(request.validationError);
                response.status(400).send({
                    error: {message: request.validationError.message},
                    validation: request.validationError.validation
                });
                return reject(request.validationError);
            }
            else
            {
                return resolve();
            }
        });
    }
}

module.exports = FastifyRoute;
