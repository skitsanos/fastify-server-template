![](https://repository-images.githubusercontent.com/188831518/a0f5d780-8b63-11e9-942d-e62b183c5578)

Template for building REST APIs and web applications running on [Fastify](https://www.fastify.io). The idea behind this project is to minimize an effort on creating web application backend through unified server core and rather concentrate on writing URL/route handlers.

So that's what it does. all you need to do is to write your route handlers.

---


### How to install

Clone sources locally
```sh
git clone https://github.com/skitsanos/fastify-server-template.git
```

Install dependencies

```sh
cd fastify-server-template
npm install
```

### Project folder structure

Minimal folder structure for your Fastify driven application would look like this:

```
--/
  /config
  /framework
  /routes
```

Although if you are running full blown application with HTML rendering via [Handlebars](https://handlebarsjs.com)

```
--/
  /config
  /framework
  /routes
  /schemas
  /ui
```
### Configuring your server

Although this template allows you to run your server as it is, there is number of things you can configure by modifying _/config/server.json_ file.

#### Allowing serving static content

```
"static": {
    "root": "ui"
  },
``` 

Setting _static.root_ property to 'ui' will enable serving static content from _{server root}/ui_ folder.

#### Cookies support

```
"cookies": {}
```

If configuration has _cookies_ section, server will enable _fastify-cookie_ plugin. This plugin's cookie parsing works via Fastify's onRequest hook. More details about this plugin you can read here: [https://github.com/fastify/fastify-cookie](https://github.com/fastify/fastify-cookie)

#### Enabling View Engine

>For the moment only [handlebars](https://handlebarsjs.com) is supported. 

```
 "viewEngine": {
    "engine": "handlebars",
    "templatesDir": "ui",
    "partialsDir": "ui/partials",
    "config": {
      "preventIndent": true
    }
  },
```

#### Upgrading insecure requests
The HTTP Upgrade-Insecure-Requests request header sends a signal to the server expressing the client's preference for an encrypted and authenticated response, and that it can successfully handle the upgrade-insecure-requests CSP directive.

```
"upgradeInsecureRequests": false,
```

If enabled, once request received with _upgrade-insecure-requests_ HTTP header, server will redirect request to HTTPS version.

#### CORS

CORS default configuration (/config/cors.js)

```json
{
  "origin": "*",
  "allowedHeaders": [
    "Content-Type",
    "Authorization"
  ]
}
```
