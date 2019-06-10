const Route = require('~framework/fastify/route');
const fsutils = require('~framework/utils/fs-utils');
const auth = require('~framework/auth/file-based');

class Resource extends Route
{
    constructor(instance)
    {
        const config = {
            method: 'POST',
            url: '/api/login',
            attachValidation: true
        };

        //add schema if any
        const jschema = fsutils.readFile('~schemas/Login.jschema');
        if (jschema !== undefined)
        {
            config.schema = {
                body: 'Login.jschema#'
            };
        }

        super(instance, config);
    }

    async handler(req, res)
    {
        super.handler(req, res).then(() =>
        {
            //todo: perform authentication
            new auth().login(req.body.email, req.body.password).then(result =>
            {
                res.send({result: result});
            }).catch(err =>
            {
                res.status(400).send({error: {message: err.message}});
            });

        }).catch(err =>
        {
            res.status(400).send({error: {message: err.message}});
        });
    }
}

module.exports = Resource;
