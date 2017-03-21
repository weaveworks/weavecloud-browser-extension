import { renderLink } from './components/link';

let injectionTimer;

function injectLinks({ baseUrl, instances, links }) {
  // find panel title element to place analysis
  links.forEach(({ rowIndex, panelIndex, link }) => {
    const row = document.querySelectorAll('.dash-row')[rowIndex];
    if (row) {
      const panel = row.querySelectorAll('.panel')[panelIndex];
      if (panel) {
        const title = panel.querySelector('.panel-title');
        if (title) {
          const container = document.createElement('span');
          title.append(container);
          renderLink(container, { baseUrl, instances, link });
        }
      }
    }
  });
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
