//@flow
import React from 'react'
import Routes from './components/routes';
import * as serviceWorker from './serviceWorker';
import { AppRegistry } from 'react-native';

AppRegistry.registerComponent('App', () => Routes);

AppRegistry.runApplication('App', {
  rootTag: document.getElementById('Main')
});

serviceWorker.unregister();