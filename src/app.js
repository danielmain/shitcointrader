//@flow
import App from './App.jsx';
import * as serviceWorker from './serviceWorker';
import { AppRegistry } from 'react-native';

AppRegistry.registerComponent('App', () => App);

AppRegistry.runApplication('App', {
  rootTag: document.getElementById('Main')
});

serviceWorker.unregister();