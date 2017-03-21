import React from 'react';
import ReactDOM from 'react-dom';

const LOCAL = true;

export function renderLink(container, props) {
  ReactDOM.render(<QueryLink {...props} />, container);
}

export const styles = {
  panel: { position: 'absolute', opacity: 0.7, right: '2em', fontSize: '0.8em', paddingTop: 3 },
  title: { position: 'relative', top: 16, left: 8 },
};

export default function QueryLink({ baseUrl, instances, params, style }) {
  const isSingleInstance = instances.length === 1;
  const urlPrefix = LOCAL ? 'http://localhost:4046' : baseUrl;
  const queryJson = encodeURIComponent(JSON.stringify(params));
  const caption = 'View on Weave Cloud';
  const label = isSingleInstance ? '' : caption;

  return (
    <span style={style}>
      {label}
      {instances.map((instance, i) => <a
        key={instance.id}
        style={{ paddingLeft: 3 }}
        href={`${urlPrefix}/prom/${instance.id}/notebook/new/${queryJson}`}
        target={urlPrefix}
        title={instance.name}>
        {isSingleInstance && caption}
        {!isSingleInstance && `[${i + 1}]`}
      </a>
      )}
    </span>
  );
}
