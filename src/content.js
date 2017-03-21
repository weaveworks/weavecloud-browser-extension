import { renderLink, styles } from './components/link';

let injectionTimer;

function injectLinks({ baseUrl, instances, graphs }) {
  // find panel title element to place link for individual graph
  graphs.forEach(({ rowIndex, panelIndex, ...graph }) => {
    const row = document.querySelectorAll('.dash-row')[rowIndex];
    if (row) {
      const panel = row.querySelectorAll('.panel')[panelIndex];
      if (panel) {
        const title = panel.querySelector('.panel-title');
        if (title) {
          const container = document.createElement('span');
          title.append(container);
          const params = { cells: [graph] };
          const style = styles.panel;
          renderLink(container, { baseUrl, instances, params, style });
        }
      }
    }
  });

  // find dashboard title to place link to show all graphs
  const titleIconsContainer = document.querySelector('.dashnav-action-icons');
  if (titleIconsContainer) {
    const container = document.createElement('li');
    titleIconsContainer.append(container);
    const params = { cells: graphs };
    const style = styles.title;
    renderLink(container, { baseUrl, instances, params, style });
  }
}

function hasRendered() {
  return document.querySelector('.panel');
}

function maybeInjectLinks(payload, skip) {
  clearTimeout(injectionTimer);
  if (!skip && hasRendered()) {
    injectLinks(payload);
  } else {
    injectionTimer = setTimeout(() => {
      maybeInjectLinks(payload);
    }, 3000);
  }
}

chrome.runtime.onMessage.addListener((payload, sender, sendResponse) => {
  console.log('payload received', payload);
  maybeInjectLinks(payload, true);
  sendResponse({ success: true });
});
