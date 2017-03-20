import React from 'react';
import ReactDOM from 'react-dom';

export function renderLink(container, queries) {
  ReactDOM.render(<QueryLink queries={queries} />, container);
}

export default class QueryLink extends React.Component {
  render() {
    const { queries } = this.props;
    if (queries.length === 0) {
      return '';
    }

    const baseUrl = 'http://localhost:4046/prom/proud-wind-05/notebook/new/';
    const queryJson = encodeURIComponent(JSON.stringify({ queries }));
    const url = `${baseUrl}${queryJson}`;

    return (
      <a
        style={{ position: 'absolute', opacity: 0.7, right: '2em', fontSize: '0.8em', paddingTop: 3 }}
        href={url} target={baseUrl} title={`Explore on Weave Cloud: ${baseUrl}`}>
        Explore on Weave Cloud <i className="fa fa-share-square-o" />
      </a>
    );
  }

}
