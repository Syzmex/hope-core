

// import Ajax from './ajax/ajax';
import * as utils from './utils';
import middleware from './middleware';
import is, { kindOf, property } from './is';

export default middleware;
export store from './store';
export { mapper } from './mapper';
export { kindOf, property, is, utils };
export { session, storage, cookie } from './browser';

export Chain from './chain';
export Ajax from './ajax/ajax';
export Polling from './polling';
