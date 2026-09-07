import React from 'react';
import { t } from './index';

// Local JSX adapter: resolve source-message keys only at the presentation
// boundary. IDs, values, financial records, keys and event handlers stay raw.
// No DOM rewriting: React remains the sole owner of its text nodes.
function translateChild(child) {
  return typeof child === 'string' ? t(child) : Array.isArray(child) ? child.map(translateChild) : child;
}
function createElement(type, props, ...children) {
  if (typeof type === 'string' || type === React.Fragment) {
    if (props) {
      props = { ...props };
      for (const key of ['aria-label', 'aria-valuetext', 'alt', 'placeholder', 'title']) if (typeof props[key] === 'string') props[key] = t(props[key]);
    }
    children = children.map(translateChild);
  }
  return React.createElement(type, props, ...children);
}
export default { ...React, createElement };
