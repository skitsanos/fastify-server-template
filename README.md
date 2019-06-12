![](https://repository-images.githubusercontent.com/188831518/a0f5d780-8b63-11e9-942d-e62b183c5578)

Template for building REST APIs and web applications running on [Fastify](https://www.fastify.io). The idea behind this project is to minimize an effort on creating web application backend through unified server core and rather concentrate on writing URL/route handlers.

So that's what it does. all you need to do is to write your route handlers.

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
