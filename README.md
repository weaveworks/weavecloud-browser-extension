# Weave Cloud Browser Extensions

Currently chrome-only.

* Inject links into Grafana dashboards

## Setup

Install dependencies: `npm install`

Build extension: `npm run build`

Install extension: Open Chrome's extensions settings, enable the Developer mode,
then point "Load unpacked extensions" to the `chrome` directory of this repository.

## Development

`npm start` starts webpack with a watcher.

* `background.js` is responsible for detecting navigation to dashboards. If
a dashboard is detected, its definition is loaded and parsed for graph panels.
The extracted queries are then sent to `content.js`

* `content.js` builds links for the queries and injects them into the dashboard

* `link.jsx` builds the link markup (using React -- this is currently overkill,
  but helpful if we want to build browser-action popups)

## Publish

1. Make sure `LOCAL = false` in `src/components/link.jsx`

2. Run `npm i && webpack` to build the bundles.

3. Zip the `chrome` directory.

4. Make sure you are a member of the Weaveworks Group `chrome-webstore`, then
go to https://chrome.google.com/webstore/developer/dashboard and update the
extension by uploading the zip file.

## LICENSE

[APL2.0](LICENSE)
