import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';

import Dash from './dash';

import * as serviceWorker from './serviceWorker';

ReactDOM.render(<Dash />, document.getElementById('root'));

// Online -> unregister()
// Offline -> register()
serviceWorker.register();
