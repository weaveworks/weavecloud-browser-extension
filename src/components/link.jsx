import React from 'react';
import ReactDOM from 'react-dom';

const LOCAL = true;

export function renderLink(container, props) {
  ReactDOM.render(<QueryLink {...props} />, container);
}

export default class QueryLink extends React.Component {
  render() {
    const { baseUrl, link, instances } = this.props;
    if (!link.queries || link.queries.length === 0) {
      return '';
    }

    const isSingleInstance = instances.length === 1;
    const urlPrefix = LOCAL ? 'http://localhost:4046' : baseUrl;
    const queryJson = encodeURIComponent(JSON.stringify(link));
    const caption = 'View on Weave Cloud';
    const label = isSingleInstance ? '' : caption;

    return (
      <span style={{ position: 'absolute', opacity: 0.7, right: '2em', fontSize: '0.8em', paddingTop: 3 }}>
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

}
