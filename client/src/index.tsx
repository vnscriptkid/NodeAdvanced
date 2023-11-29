import "materialize-css/dist/css/materialize.min.css";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware, compose } from "redux";
import reduxThunk from "redux-thunk";
import { createDevTools } from "@redux-devtools/core";

import { LogMonitor } from "@redux-devtools/log-monitor";
import { DockMonitor } from "@redux-devtools/dock-monitor";

import App from "./components/App.tsx";

import axios, { AxiosStatic } from "axios";
import { reducers } from "./reducers/index.ts";

declare global {
  interface Window {
    axios: AxiosStatic;
  }
  interface NodeModule {
    hot: any;
  }
}

window.axios = axios;

// create dev tool without monitor
const DevTools = createDevTools(
  // Monitors are individually adjustable with props.
  // Consult their repositories to learn about those props.
  // Here, we put LogMonitor inside a DockMonitor.
  // Note: DockMonitor is visible by default.
  <DockMonitor
    toggleVisibilityKey="ctrl-h"
    changePositionKey="ctrl-q"
    defaultIsVisible={true}
  >
    <LogMonitor theme="tomorrow" />
  </DockMonitor>
);

const enhancer = compose(
  // Middleware you want to use in development:
  applyMiddleware(reduxThunk),
  // Required! Enable Redux DevTools with the monitors you chose
  DevTools.instrument()
);

export default function configureStore() {
  // Note: only Redux >= 3.1.0 supports passing enhancer as third argument.
  // See https://github.com/reactjs/redux/releases/tag/v3.1.0
  // const store = createStore(rootReducer, initialState, enhancer);
  const store = createStore(reducers, {}, enhancer);

  // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
  if (module.hot) {
    module.hot.accept("./reducers/index.ts", () =>
      store.replaceReducer(
        require("./reducers/index.ts") /*.default if you use Babel 6+ */
      )
    );
  }

  return store;
}

ReactDOM.render(
  <Provider store={configureStore()}>
    <App />
  </Provider>,
  document.querySelector("#root")
);
