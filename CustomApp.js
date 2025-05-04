import React from 'react';
import { registerRootComponent } from 'expo';
import App from './App';

const CustomApp = () => {
  return <App />;
};

registerRootComponent(CustomApp);

export default CustomApp;
