

import omit from 'omit.js';
import Ajax from './ajax/ajax';
import compose from './compose';
import { invariant } from './utils';
import is from './is';


const noop = () => {};

/**
 * options {
 *   interval = 1000
 * }
 */

const defaultOption = {
  interval: 1000,
  timeout: 30 * 60 * 1000,
  getToken: noop
};


function getOption({
  interval,
  timeout,
  getToken,
  ...other
}) {

  const options = Object.assign( other, defaultOption );

  if ( !is.Number( interval ) || !isFinite( interval )) {
    options.interval = 1000;
  } else {
    options.interval = interval;
  }

  if ( is.Number( timeout ) && isFinite( timeout )) {
    options.timeout = Math.max( 0, timeout );
  }

  if ( is.Function( getToken )) {
    options.getToken = getToken;
  }

  return options;
}


function Polling( options ) {

  let xhr;
  let timer;
  let started;
  let callbacks = noop;
  const returnMethod = {};


  function alwaysHandle( err, results ) {
    if ( !err ) {
      const token = options.getToken( results[0]);
      callbacks({ token, result: results[0] });
    }
  }

  function send() {
    timer = null;
    const ajaxOptions = omit( options, [ 'interval', 'getToken' ]);
    return Ajax( ajaxOptions ).always( alwaysHandle ).finally(() => {
      if ( started ) {
        xhr = null;
        timer = setTimeout(() => send(), options.interval );
      }
    });
  }

  function start() {
    if ( !started ) {
      started = true;
      xhr = send();
    }
    return returnMethod;
  }

  function stop() {
    started = false;
    if ( xhr ) {
      xhr.abort();
      xhr = null;
    }
    if ( timer ) {
      clearTimeout( timer );
      timer = null;
    }
    return returnMethod;
  }

  function maybe( token_, callback ) {
    return function ( set ) {
      const { token, result } = set;
      if ( is.Function( token_ )) {
        token_( result );
      } else if ( is.Undefined( token ) || token_ === token ) {
        callback( result );
      }
      return set;
    };
  }

  const onResponse = compose( cb => {
    callbacks = callbacks !== noop ? compose( callbacks, cb ) : cb;
    return returnMethod;
  }, maybe );

  Object.assign( returnMethod, { start, stop, onResponse });

  return returnMethod;
}


export default compose( Polling, getOption );

