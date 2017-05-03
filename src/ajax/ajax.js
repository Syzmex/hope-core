

import pick from 'object.pick';
import ajaxXhr from './ajax-xhr';
import compose from '../compose';
import is, { property } from '../is';
import { invariant, log } from '../utils';
import Chain from '../chain';


const ajaxSymbol = Symbol( 'ajax' );
const ajaxHandler = Symbol( 'ajaxHandler' );
const isAjax = property( ajaxSymbol );
const globalMap = {

  // converters: {
  //   xml:
  //   html:
  //   script:
  //   json: JSON.parse,
  //   jsonp:
  // },

  urls: {},
  tokens: new Map(),

  setURLTokens( pairs ) {
    const tokens = globalMap.tokens;
    Object.entries( pairs ).forEach(([ token, value ]) => {
      tokens.set( new RegExp( `{${token}}`, 'g' ), value );
    });
  },

  setURLAlias( aliases, transform ) {
    const urls = globalMap.urls;
    Object.entries( aliases ).forEach(([ alias, url ]) => {
      urls[alias] = url;
    });
    if ( is.Function( transform )) {
      globalMap.URLTransform = transform;
    }
  },

  setDataTransform( transform ) {
    if ( is.Function( transform )) {
      globalMap.dataTransform = transform;
    }
  },

  setAssert( assert ) {
    if ( is.Function( assert )) {
      globalMap.assert = assert;
    }
  },

  URLTransform( alias, tokens ) {
    let url = globalMap.urls[alias];
    if ( url ) {
      tokens.forEach(( value, regexp ) => {
        if ( regexp.test( url )) {
          url = url.replace( regexp, value );
        }
      });
      return url;
    }
    return alias;
  },

  dataTransform( response, type_ ) {
    return response;
  },

  assert( response, resolve_, reject_ ) {
    resolve_( response );
  }

};


// eslint-disable-next-line
const allocator = ( resolve, reject, options ) => ( success ) => ( cdResponse, xhr ) => {
  const response = globalMap.dataTransform( cdResponse );
  if ( success ) {
    if ( is.Function( options.assert )) {
      options.assert( response, resolve, reject );
    } else {
      globalMap.assert( response, resolve, reject );
    }
  // abort/timeout only print one warn
  } else if ( xhr.status === 0 ) {
    const txt = xhr.statusText === 'timeout' ? 'timeout' : 'abort';
    log( 'warn', `Url (${options.url}) is ${txt}.` );
  } else {
    reject( response );
  }
};


function URLFormat( alias ) {
  return globalMap.URLTransform( alias, globalMap.tokens );
}


function getMethod({ data, method }) {
  if ( method ) {
    return method;
  }
  if ( data ) {
    return 'post';
  }
  return 'get';
}


function getOptions( url, options_ ) {

  const options = {};

  // url is String, options is undefined/plain-object, two parameters
  if ( is.String( url )) {
    options.url = url;
    if ( is.PlainObject( options_ )) {
      Object.assign( options, options_ );
    }
    options.method = getMethod( options );
    delete options[ajaxHandler];

  // url is PlainObject, only one parameter
  } else if ( is.PlainObject( url )) {
    Object.assign( options, url );
    options.method = getMethod( options );
    delete options[ajaxHandler];

  // url is Function, only one parameter
  } else if ( is.Function( url )) {
    options[ajaxHandler] = url;
  }

  // type default 'text'
  if ( is.Undefined( options.type ) || options.type === '' ) {
    options.type = 'text';
  }

  if ( is.String( options.url )) {
    options.url = URLFormat( options.url );
  }

  return options;
}


/**
 * options {
 *   assert,
 *   type: 'text',
 *   headers: object
 *   timeout: number
 *   ontimeout: function
 *   baseUrl: string,
 *   data: object,
 *   url: string,
 *   withCredentials: boolean
 * }
 */
function Ajax( url, options ) {

  let next;
  let getNextXhrs;
  let sending = null;
  let handlerThen = null;
  let handlerCatch = null;
  let handlerBefore = null;
  let handlerFinally = null;

  const xhrs = [];
  const builders = [];
  const chainMethod = {

    [ajaxSymbol]: true,

    then( callback ) {
      handlerThen = handlerThen ? compose( callback, handlerThen ) : callback;
    },

    catch( callback ) {
      handlerCatch = handlerCatch ? compose( callback, handlerCatch ) : callback;
    },

    always( callback ) {
      chainMethod.then(( ...results ) => callback( null, results ));
      chainMethod.catch( err => callback( err, null ));
    },

    before( callback ) {
      handlerBefore = handlerBefore ? compose( callback, handlerBefore ) : callback;
    },

    finally( callback ) {
      handlerFinally = handlerFinally ? compose( callback, handlerFinally ) : callback;
    },

    getXhr() {
      if ( getNextXhrs ) {
        return getNextXhrs();
      }
      return xhrs;
    },

    abort() {
      const xhrs = chainMethod.getXhr();
      while ( xhrs.length ) {
        xhrs.pop().abort();
      }
    }

  };


  // create new chain of ajax
  function newAjax( options ) {
    let abort;
    const chain = Chain.of(( resolve, reject ) => {
      const callback = allocator( resolve, reject, options );
      abort = ajaxXhr( options )
        .then( callback( true ))
        .catch( callback( false )).abort;
    });
    chain.abort = abort;
    return chain;
  }


  function nextAjax( options, ajaxHandler ) {
    if ( sending ) {
      if ( next ) {
        const prev = next;
        next = function ( ...result ) {
          return prev( ...result ).ajax( options || ajaxHandler );
        };
      } else {
        next = ajaxHandler
          ? function ( ...result ) {
            return ajaxHandler( ...result ).finally( handlerFinally );
          } : function () {
            return Ajax( options ).finally( handlerFinally );
          };
      }
    } else {
      builders.push( options || ajaxHandler );
    }
  }


  function createAjax( options, method ) {
    if ( options.url ) {
      nextAjax( Object.assign( options, { method }));
      return true;
    } else if ( options[ajaxHandler]) {
      nextAjax( null, options[ajaxHandler]);
      return true;
    }
    return false;
  }


  function append( funcName, ...args ) {
    const prev = next;
    next = function ( ...result ) {
      return prev( ...result )[funcName]( ...args );
    };
  }


  function remove( xhr ) {
    xhrs.splice( xhrs.indexOf( xhr ), 1 );
  }


  function setXhrs() {
    return builders.reduce(( xhrs, options ) => {
      let ajaxObject;
      if ( is.Function( options )) {
        ajaxObject = options()
          .always(() => remove( ajaxObject ));
      } else {
        ajaxObject = newAjax( options )
          .always(() => remove( ajaxObject ));
      }
      xhrs.push( ajaxObject );
      return xhrs;
    }, xhrs );
  }


  function getNext( ajaxObject ) {
    invariant(
      isAjax( ajaxObject ),
      'Hope: Expecting a ajax-object be returned.'
    );
    getNextXhrs = ajaxObject.getXhr;
  }


  function connection() {
    if ( sending ) return;

    const xhrs = setXhrs();
    if ( handlerBefore ) {
      handlerBefore( ...xhrs );
    }
    sending = Chain.all( xhrs ).then( results => {
      let result;
      if ( handlerThen ) {
        result = handlerThen( ...results );
      }
      if ( next ) {
        if ( is.Defined( result )) {
          getNext( next( result ));
        } else {
          getNext( next( ...results ));
        }
      }
    }).catch( err => {
      if ( handlerCatch ) {
        return handlerCatch( err.length === 1 ? err[0] : err );
      }
      // throw err.length === 1 ? err[0] : err;
    });
  }


  // ajax methods
  [ 'ajax', 'get', 'post', 'put', 'delete' ].forEach( method => {
    chainMethod[method] = compose( options => {
      if ( createAjax( options, method === 'ajax' ? options.method : method )) {
        return chainMethod;
      }
      return pick( chainMethod, [ 'ajax', 'get', 'post', 'put', 'delete' ]);
    }, getOptions ); /* ( url, options ) */
  });


  // add xhr connection
  [ 'then', 'catch', 'always', 'finally' ].forEach( func => {
    const funcBody = chainMethod[func];
    chainMethod[func] = function ( callback ) {
      connection();
      if ( callback ) {
        funcBody( callback );
      }
      return chainMethod;
    };
  });


  // if next ajax is exist, all function will append to the next ajax
  [ 'ajax', 'get', 'post', 'put', 'delete', 'before', 'then', 'catch',
    'always', 'finally' ].forEach( func => {
      const body = chainMethod[func];
      chainMethod[func] = function ( ...args ) {
        if ( next ) {
          append( func, ...args );
          return chainMethod;
        }
        return body( ...args );
      };
    });


  // success === done === then && error === fail === catch
  chainMethod.success =
  chainMethod.done = chainMethod.then;
  chainMethod.error =
  chainMethod.fail = chainMethod.catch;

  // init
  return chainMethod.ajax( url, options );
}


Object.assign( Ajax, pick( globalMap, [
  'setURLTokens',
  'setURLAlias',
  'setDataTransform',
  'setAssert'
]));

export default Ajax;

