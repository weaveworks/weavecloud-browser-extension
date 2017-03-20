/* eslint-disable no-plusplus */

// Send queries to content script for injection
function sendLinkData(payload, details) {
  chrome.tabs.sendMessage(details.tabId, payload, (res) => {
    console.log('sendLinkData success', res.success);
  });
}

// Extract queries from Grafana dashboard json
function processPanels(dashboard, details) {
  console.log('processPanels', dashboard);
  const rows = dashboard.rows;
  const links = [];
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const panels = row.panels;
    for (let panelIndex = 0; panelIndex < panels.length; panelIndex++) {
      const panel = panels[panelIndex];
      // panel.target has the queries
      if (panel.type === 'graph' && panel.targets) {
        const queries = panel.targets.map(t => t.expr);
        links.push({ rowIndex, panelIndex, queries });
      }
    }
  }
  if (links.length > 0) {
    sendLinkData({ links }, details);
  }
}

// Load currently displayed dashboard definition
function loadDashboard(url) {
  const dashboardUrl = url.replace('dashboard/file', 'api/dashboards/file');
  return fetch(dashboardUrl, { credentials: 'include' })
    .then(res => res.json());
}

// Grafana dashboard shibboleth
const filters = {
  url: [{ urlContains: 'dashboard/file' }]
};

function onNavigate(details) {
  console.log(`Recognized navigation to: ${details.url}`);
  loadDashboard(details.url)
    .then(json => processPanels(json.dashboard, details));
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
