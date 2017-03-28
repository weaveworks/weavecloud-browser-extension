import { renderLink, styles } from './components/link';

let injectionTimer;

function injectLinks({ baseUrl, instances, graphs, time, title }) {
  // find panel title element to place link for individual graph
  graphs.forEach(({ rowIndex, panelIndex, ...graph }) => {
    const row = document.querySelectorAll('.dash-row')[rowIndex];
    if (row) {
      const panel = row.querySelectorAll('.panel')[panelIndex];
      if (panel) {
        const titlePanel = panel.querySelector('.panel-header');
        if (titlePanel) {
          const panelContainerClass = 'weave-panel-link';
          let container = panel.querySelector(`.${panelContainerClass}`);
          if (!container) {
            container = document.createElement('span');
            container.className = panelContainerClass;
            titlePanel.append(container);
          } else {
            container.innerHTML = '';
          }
          const params = { cells: [graph], title: graph.title, time };
          const style = styles.panel;
          renderLink(container, { baseUrl, instances, params, style });
        }
      }
    }
  });

  // find dashboard title to place link to show all graphs
  const titleIconsContainer = document.querySelector('.dashnav-action-icons');
  if (titleIconsContainer) {
    const titleContainerClass = 'weave-dashboard-link';
    let container = titleIconsContainer.querySelector(`.${titleContainerClass}`);
    if (!container) {
      container = document.createElement('li');
      container.className = titleContainerClass;
      titleIconsContainer.append(container);
    } else {
      container.innerHTML = '';
    }
    const params = { cells: graphs, title, time };
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
