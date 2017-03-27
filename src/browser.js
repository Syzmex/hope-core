

/* globals sessionStorage:true localStorage:true document:true window:true */
import is, { kindOf } from './is';
import { invariant, log } from './utils';


const same = v => v;
const isNonEmptyString = s => is.String( s ) && !s;


/**
 * session/local storage can set/get object/array
 */

function storageFactory( storageInstance ) {
  const storage = {};
  const sringifyRegexp = /^(_array_|_object_)\|/;
  const type = storageInstance === sessionStorage ? 'session' : 'storage';

  storage.set = function ( name, value ) {
    let val = value;
    invariant(
      is.Array( value ) || is.PlainObject( value ),
      `Hope: Expecting value of ${type}.set is a plain-object or array in instanceof check, but got ${kindOf( value )}`,
    );
    if ( is.Array( value )) {
      val = `_array_|${JSON.stringify( value )}`;
    } else {
      val = `_object_|${JSON.stringify( value )}`;
    }
    storageInstance.setItem( name, val );
  };

  storage.get = function ( name ) {
    const value = storageInstance.getItem( name );
    try {
      if ( sringifyRegexp.test( value )) {
        return JSON.parse( value.replace( sringifyRegexp, '' ));
      }
    } catch ( err ) {
      log( 'error', `Hope: A error has occurred when read the '${name}'.`, err );
    }
    return value;
  };

  storage.has = function ( name ) {
    return is.Defined( storage.get( name ));
  };

  storage.clear = storageInstance.clear.bind( storageInstance );
  storage.remove = storageInstance.removeItem.bind( storageInstance );

  storage.forEach = ( callback, context = null ) => {
    invariant(
      is.Function( callback ),
      `Hope: Expecting callback of ${type}.forEach is a function in instanceof check, but got ${kindOf( callback )}`,
    );
    let i = 0;
    const l = storageInstance.length;
    for ( ; i < l; i++ ) {
      const key = storageInstance.key( i );
      callback.call( context, key, storage.get( key ));
    }
  };

  storage.getAll = function () {
    const all = {};
    storage.forEach(( key, val ) => ( all[key] = val ));
    return all;
  };

  return storage;
}


/**
 * browser cookie
 */

const checkCookieName = function ( name ) {
  invariant(
    isNonEmptyString( name ),
    'Hope: Cookie name must be a non-empty string.',
  );
};

const decode = function ( value ) {
  try {
    return decodeURIComponent( value );
  } catch ( err ) {
    log( 'error', 'Hope: A error has occurred in decodeURIComponent.', err );
  }
  return value;
};

const encode = function ( value ) {
  try {
    return encodeURIComponent( value );
  } catch ( err ) {
    log( 'error', 'Hope: A error has occurred in encodeURIComponent.', err );
  }
  return value;
};

const parseCookie = function ( str ) {
  const obj = {};
  const pairs = str.split( /\s*;\s*/ );

  if ( pairs[0] === '' ) return obj;

  pairs.forEach(( pair, i ) => {
    const _p = pair[i].split( '=' );
    obj[decode( _p[0])] = decode( _p[1]);
  });

  return obj;
};


const cookieFactory = function () {
  const cookie = {};

  cookie.set = function ( name, value, options = {}) {
    let expires = options.expires || options.maxage;
    const secure = options.secure;
    const domain = options.domain;
    const path = options.path;

    checkCookieName( name );

    invariant(
      is.Number( expires ) || is.Undefined( expires ),
      'Hope: Cookie expires/maxage must be a number.',
    );

    invariant(
      is.Boolean( secure ) || is.Undefined( expires ),
      'Hope: Cookie secure must be a boolean.',
    );

    invariant(
      is.String( domain ) || is.Undefined( expires ),
      'Hope: Cookie domain must be a string.',
    );

    invariant(
      is.String( path ) || is.Undefined( expires ),
      'Hope: Cookie path must be a string.',
    );

    if ( value === null || value === '' ) {
      expires = -1;
    }

    let txt = `${encode( name )}=${encode( String( value ))}`;

    if ( expires ) {
      expires = new Date( +new Date() + expires );
      txt += `; expires=${expires.toUTCString()}`;
    }

    if ( isNonEmptyString( domain )) txt += `; domain=${domain}`;
    if ( isNonEmptyString( path )) txt += `; path=${path}`;
    if ( secure ) txt += '; secure';

    document.cookie = txt;
  };

  cookie.getAll = function () {
    try {
      return parseCookie( document.cookie );
    } catch ( err ) {
      log( 'error', 'Hope: A error has occurred in parseCookie.', err );
    }
    return {};
  };

  cookie.get = function ( name, opts = {}) {
    checkCookieName( name );
    let options = Object.create( opts );
    if ( is.Function( opts )) {
      options = { converter: options };
    }
    return ( options.converter || same )( cookie.getAll()[name]);
  };

  cookie.forEach = function ( callback ) {
    const all = cookie.getAll();
    Object.keys( all ).forEach( callback );
    return cookie;
  };

  cookie.forEach = function ( callback ) {
    const all = cookie.getAll();
    Object.keys( all ).forEach( callback );
    return cookie;
  };
  cookie.has = name => cookie.get( name ) !== undefined;
  cookie.clear = () => cookie.forEach( name => cookie.remove( name ));
  cookie.remove = ( name, options ) => cookie.set( name, null, options );

  return window && cookie;
};


export default {

  // sessionStorage
  session: storageFactory( sessionStorage ),

  // localStorage
  storage: storageFactory( localStorage ),

  cookie: cookieFactory()
};

