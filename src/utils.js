

import invariant from 'invariant';
export { invariant };

// add symbol
export const sym = id => Symbol( id );

// Symbol HOPE_ACTION
export const HOPE_ACTION = sym( 'HOPE_ACTION' );

export function hopeEnhancer( action ) {
  return Object.defineProperty( action, HOPE_ACTION, { value: true });
}

export const isDev = process && process.env.NODE_ENV === 'development';

export function log( level, message, error = '' ) {
  if ( isDev ) {
    /* eslint-disable no-console */
    if ( typeof window === 'undefined' ) {
      console.log( `Hope: ${message}\n${( error && error.stack ) || error}` );
    } else {
      console[level]( ...[message].concat( error ? [ '\n', error ] : []));
    }
  }
}

