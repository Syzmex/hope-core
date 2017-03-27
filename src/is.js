

import kindOf from 'kind-of';
import isObject from 'isobject';
import isPlainObject from 'is-plain-object';


const MAX_ARRAY_INDEX = ( 2 ** 53 ) - 1;
const isDefined = v => v !== null && v !== undefined;
const isUndefined = v => v === null || v === undefined;

// https://github.com/jonschlinkert/kind-of
export { kindOf };

export function property( key ) {
  return function ( obj ) {
    return isUndefined( obj ) ? undefined : obj[key];
  };
}

export function instanceOf( Cls ) {
  return function ( obj ) {
    return ( obj instanceof Cls );
  };
}

// Number, Function, RegExp, Boolean, Date, Error, Arguments,
// PlainObject, Object, Array, ArrayLike, Element
const is = {
  Undefined: isUndefined,
  Defined: isDefined,
  Element: v => !!( v && v.nodeType === 1 ),
  PlainObject: isPlainObject,
  Object: isObject
};


[ 'Array', 'Number', 'Function', 'RegExp', 'Boolean', 'Date', 'Error',
  'Arguments', 'Null', 'String' ].forEach( name => {
    is[name] = v => kindOf( v ) === name.toLowerCase();
  });


const getLength = property( 'length' );
is.ArrayLike = function ( collection ) {
  const length = getLength( collection );
  return is.Number( length ) && length >= 0 && length <= MAX_ARRAY_INDEX;
};


export default is;

