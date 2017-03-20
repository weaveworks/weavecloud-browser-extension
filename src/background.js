/* eslint-disable no-plusplus */


let currentUrl;

function sendLinkData(payload) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, payload, (res) => {
      console.log('sendLinkData success', res.success);
    });
  });
}

function processPanels({ dashboard }) {
  console.log(dashboard);
  const rows = dashboard.rows;
  const links = [];
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const panels = row.panels;
    for (let panelIndex = 0; panelIndex < panels.length; panelIndex++) {
      const panel = panels[panelIndex];
      if (panel.type === 'graph' && panel.targets) {
        const queries = panel.targets.map(t => t.expr);
        links.push({ rowIndex, panelIndex, queries });
      }
    }
  }
  if (links.length > 0) {
    sendLinkData({ links });
  }
}

function loadDashboard(url) {
  const dashboardUrl = url.replace('dashboard/file', 'api/dashboards/file');
  return fetch(dashboardUrl, { credentials: 'include' })
    .then(res => res.json());
}

function isOnDashboard(url) {
  return url.indexOf('dashboard/file') > -1;
}

function startRequest() {
  if (currentUrl) {
    loadDashboard(currentUrl)
      .then(processPanels);
  // } else {
  //   scheduleRequest();
  }
}

function onInit() {
  console.log('onInit');
  localStorage.requestFailureCount = 0;  // used for exponential backoff
  chrome.tabs.getCurrent((tab) => {
    currentUrl = tab.url;
    startRequest();
  });
}

chrome.runtime.onInstalled.addListener(onInit);

const filters = {
  url: [{ urlContains: 'dashboard/file' }]
};

function onNavigate(details) {
  if (details.url && isOnDashboard(details.url)) {
    console.log(`Recognized navigation to: ${details.url}`);
    currentUrl = details.url;
    startRequest();
  }
}

if (chrome.webNavigation && chrome.webNavigation.onDOMContentLoaded &&
    chrome.webNavigation.onReferenceFragmentUpdated) {
  chrome.webNavigation.onDOMContentLoaded.addListener(onNavigate, filters);
  chrome.webNavigation.onReferenceFragmentUpdated.addListener(
      onNavigate, filters);
} else {
  chrome.tabs.onUpdated.addListener((_, details) => {
    onNavigate(details);
  });
}

chrome.runtime.onStartup.addListener(() => {
  console.log('Starting browser...');
  startRequest();
});
