

import split from 'split-string';
import isPrimitive from 'is-primitive';
import compose from './compose';
import is, { kindOf } from './is';
import { invariant, log, isDevelopment } from './utils';


const separator = '.';
const replaceReg = /^\$:/;
const formatReg = /^\$:.+/;
const sameThing = value => value;

const formaterCheck = function ( formater ) {
  return is.String( formater ) && formatReg.test( formater );
};

const getValueFinder = function ( source ) {
  return function ( keys, transform = sameThing ) {
    return keys.reduce(( value, key ) => {
      try {
        return transform( value[key]);
      } catch ( err ) {
        if ( isDevelopment ) {
          log( 'error', `Hope: A error has occurred when read the ${JSON.stringify( keys )}.`, err );
        }
        return value;
      }
    }, source );
  };
};

const getFormater = function ( formater ) {
  // formater like [ format-string like '$:a.b.c', transform, transform1, ... ]
  if ( is.Array( formater )) {
    const format = formater[0];
    const funcs = formater.slice( 1, formater.length );
    invariant(
      formater.length >= 2 &&
      !funcs.same( func => !is.Function( func )) &&
      is.String( format ) && formaterCheck.test( format ),
      "Hope: Expecting formater is a array like [ '$:..', ...Functions ]."
    );
    return [ format, compose( ...funcs ) ];
  }

  // string like '$:a.b.c' or values
  return [formater];
};


/**
 * @param {Object} options {
 *   spliter {RegExp}
 *   map {Object}
 * }
 * @return {Function}
 */
export default function mapper( options = {}) {
  const format = options.format;
  const sep = options.sep || separator;

  invariant(
    is.PlainObject( format ),
    `Hope: Expecting format of mapper is a plain-object, but got ${kindOf( format )}`
  );

  const getKeys = function ( str ) {
    // 'as.d\\.asa.ds' => [ 'as', 'd\\.asa', 'ds' ]
    return split( str.replace( replaceReg, '' ), { sep, keepEscaping: true });
  };

  return function compiler( source ) {
    invariant(
      !isPrimitive( source ),
      `Hope: Expecting source of mapper is a plain-object or array, but got ${kindOf( source )}`
    );

    const finder = getValueFinder( source );

    /**
     * if the formater is a string like '$:..'
     * it will be replaced with the found value
     */
    function findValue( _format ) {
      const next = {};
      Object.keys( _format ).forEach( key => {
        const value = _format[key];
        if ( is.PlainObject( value )) {
          next[key] = findValue( value );
        } else {
          const [ formater, transform ] = getFormater( value );
          if ( formaterCheck( formater )) {
            next[key] = finder( getKeys( formater ), transform );
          } else {
            next[key] = formater;
          }
        }
      });
      return next;
    }

    return findValue( format );
  };
}


window.mapper = mapper;
