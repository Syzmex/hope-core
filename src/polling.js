

import omit from 'omit.js';
import Ajax from './ajax/ajax';
import compose from './compose';
import { log } from './utils';
import is from './is';


const noop = () => {};

/**
 * options {
 *   interval = 1000
 * }
 */

const defaultOption = {
  interval: 1000,
  retryTimes: 10,
  timeout: 30 * 60 * 1000,
  getToken: noop
};


function getOption({
  interval,
  timeout,
  retryTimes,
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

  if ( is.Number( retryTimes )) {
    options.retryTimes = retryTimes > 0 ? retryTimes : defaultOption.retryTimes;
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
  let interval = 0;
  let retryTimes = options.retryTimes;
  let callbacks = noop;
  const returnMethod = {};


  function alwaysHandle( err, results ) {
    if ( !err ) {
      interval = 0;
      retryTimes = options.retryTimes;
      const token = options.getToken( results[0]);
      callbacks({ token, result: results[0] });
    } else {
      interval = Math.min( interval + options.interval, 6000 );
      retryTimes -= 1;
    }
  }

  function send() {
    timer = null;
    const ajaxOptions = omit( options, [ 'interval', 'retryTimes', 'getToken' ]);
    const { url, ...otherOptions } = ajaxOptions;
    xhr = Ajax( url, otherOptions ).always( alwaysHandle ).always( err => {
      if ( started ) {
        xhr = null;
        if ( !err || ( err && retryTimes > 0 )) {
          timer = setTimeout( send, interval );
          log( 'log', `Polling will try to conenct after ${interval / 1000} second.` );
        } else if ( err && retryTimes === 0 ) {
          log( 'warn', `Polling have tried to conenct ${options.retryTimes} times.` );
        }
      }
    });
    return xhr;
  }

  function start() {
    if ( !started ) {
      started = true;
      send();
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

