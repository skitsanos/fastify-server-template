# fastify-server-template
Template for building REST APIs and web applications running on [Fastify](https://www.fastify.io)

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
