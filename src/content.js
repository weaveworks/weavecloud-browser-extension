import { renderLink } from './components/link';

let injectionTimer;

function injectLinks(links) {
  // find panel title element to place analysis
  links.forEach(({ rowIndex, panelIndex, queries }) => {
    const row = document.querySelectorAll('.dash-row')[rowIndex];
    if (row) {
      const panel = row.querySelectorAll('.panel')[panelIndex];
      if (panel) {
        const title = panel.querySelector('.panel-title');
        if (title) {
          const container = document.createElement('span');
          title.append(container);
          renderLink(container, queries);
        }
      }
    }
  });
}

function hasRendered() {
  return document.querySelector('.panel');
}

function maybeInjectLinks(links, skip) {
  clearTimeout(injectionTimer);
  if (!skip && hasRendered()) {
    injectLinks(links);
  } else {
    injectionTimer = setTimeout(() => {
      maybeInjectLinks(links);
    }, 3000);
  }
}

chrome.runtime.onMessage.addListener((payload, sender, sendResponse) => {
  console.log('payload received', payload);
  maybeInjectLinks(payload.links, true);
  sendResponse({ success: true });
});
