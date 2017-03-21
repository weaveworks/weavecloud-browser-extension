/* eslint-disable no-plusplus */

// Send queries to content script for injection
function sendLinkData(payload, details) {
  chrome.tabs.sendMessage(details.tabId, payload, (res) => {
    console.log('sendLinkData success', res.success);
  });
}

function getQueryValue(url, key) {
  // remove any preceding url and split
  const query = url.substring(url.indexOf('?') + 1).split('&');
  let pair;
  for (let i = query.length - 1; i >= 0; i--) {
    pair = query[i].split('=');
    if (decodeURIComponent(pair[0]) === key) {
      return decodeURIComponent(pair[1] || '');
    }
  }
  return null;
}

function isTimestamp(str) {
  return str.search(/^\d+$/) === 0;
}

// Return query time params (in seconds, like Prometheus wants it)
function extractTime(dashboard, details) {
  const url = details.url;
  const from = getQueryValue(url, 'from') || dashboard.time.from;
  const to = getQueryValue(url, 'to') || dashboard.time.to;

  if (to === 'now' && from.startsWith('now') && from[3] === '-') {
    return { queryEnd: (Date.now() / 1000), queryRange: from.split('-')[1] };
  } else if (isTimestamp(to) && isTimestamp(from)) {
    return { queryEnd: parseInt(to, 10) / 1000, queryStart: parseInt(from, 10) / 1000 };
  }

  // ignore complex case (now-x mixed with timestamp), reasonable default
  return { queryEnd: (Date.now() / 1000), queryRange: '1h' };
}

// Extract queries from Grafana dashboard json
function processPanels(details, dashboard, instances, baseUrl) {
  console.log('processPanels', dashboard);
  const rows = dashboard.rows;
  const graphs = [];
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const panels = row.panels;
    for (let panelIndex = 0; panelIndex < panels.length; panelIndex++) {
      const panel = panels[panelIndex];
      // panel.target has the queries
      if (panel.type === 'graph' && panel.targets) {
        const queries = panel.targets.map(t => t.expr);
        const graph = {
          rowIndex,
          panelIndex,
          queries,
          ...extractTime(dashboard, details)
        };
        graphs.push(graph);
      }
    }
  }
  if (graphs.length > 0) {
    sendLinkData({ baseUrl, instances, graphs }, details);
  }
}

function getData(url) {
  return fetch(url, { credentials: 'include' })
    .then(res => res.json());
}

// Load currently displayed dashboard definition
function loadDashboard(url) {
  const dashboardUrl = url.replace('dashboard/file', 'api/dashboards/file');
  return getData(dashboardUrl);
}

function loadInstances(baseUrl) {
  const instancesUrl = `${baseUrl}/api/users/lookup`;
  return getData(instancesUrl);
}

// Grafana dashboard shibboleth
const filters = {
  url: [{ urlContains: 'dashboard/file' }]
};

function onNavigate(details) {
  console.log(`Recognized navigation to: ${details.url}`);
  const baseUrl = details.url.indexOf('frontend.dev') > -1 ?
    'https://frontend.dev.weave.works' :
    'https://cloud.weave.works';
  Promise.all([
    loadDashboard(details.url)
      .then(json => json.dashboard),
    loadInstances(baseUrl)
      .then(json => json.organizations),
  ]).then(values => processPanels(details, values[0], values[1], baseUrl));
}

// Listen for page load and navigation events
if (chrome.webNavigation && chrome.webNavigation.onDOMContentLoaded &&
    chrome.webNavigation.onHistoryStateUpdated) {
  chrome.webNavigation.onDOMContentLoaded.addListener(onNavigate, filters);
  chrome.webNavigation.onHistoryStateUpdated.addListener(onNavigate, filters);
  console.log('Navigation listeners registered');
} else {
  console.error('Could not register navigation listener');
}
