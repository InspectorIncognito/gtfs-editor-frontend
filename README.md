# gtfseditor-ui

## Add a new language

1. create a file with language name in locale folder. For instance `es-CL.json`, you can copy another json file and
   change its name
2. modify values according to the new language
3. add the new language in storage lang (`store/modules/lang.js`)
4. compile or run project

## Project setup

Having Node version `14.17.3` and npm version `6.14.13` installed is recommended.

```
npm install
```

Create a virtual environment file at root place with name `.env.development` with content:

```
NODE_ENV=development

VUE_APP_BASE_URL=http://endpoint_to_api

VUE_APP_MAPBOX_TOKEN=<your_mapbox_token>

VUE_APP_I18N_LOCALE=es
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

Before to create production files we need to add `.env.production` file with content:

```
NODE_ENV=production

VUE_APP_BASE_URL=http://production_endpoint_to_api

VUE_APP_MAPBOX_TOKEN=<your_mapbox_token>

VUE_APP_I18N_LOCALE=es
```

After that run:

```
npm run build -- --mode production
```

All arguments before -- are considered npm arguments and arguments after -- are passed to vue-cli-service (that's we
need).

### Run your unit tests

```
npm run test:unit
```

### Run your end-to-end tests

```
npm run test:e2e
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
