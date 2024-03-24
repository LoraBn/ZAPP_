/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import dayjs from 'dayjs';

dayjs.extend(relativeTime);
dayjs.extend(duration);

AppRegistry.registerComponent(appName, () => App);
