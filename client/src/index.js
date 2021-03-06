import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import MapSelector from './Viewer/MapSelector.js';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<MapSelector />, document.getElementById('root'));
registerServiceWorker();
