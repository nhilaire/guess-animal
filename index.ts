import { registerRootComponent } from 'expo';

import App from './App';
import { createExpoFeedback } from './src/audio/expoFeedback';
import { setFeedback } from './src/audio/feedback';

// Real sounds and haptics in the app; tests install their own fake.
setFeedback(createExpoFeedback());

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
