

import EventEmitter from 'events';
import is, { kindOf } from './is';
import { invariant } from './utils';

/**
 * cache some values that want to use globally or some values will appear in future
 */

let collection = new Map();
const emitter = new EventEmitter();
const set = collection.set.bind( collection );
const get = collection.get.bind( collection );
const getAll = () => [...collection];
const wait = ( key, func, always ) => {

  invariant(
    is.Defiend( key ),
    'Hope: key of store.wait should not be undefined/null'
  );

  invariant(
    is.Function( func ),
    `Hope: Expecting func of store.wait is a function, but got ${kindOf( func )}`
  );

  const value = get( key );
  function clear() {
    // eslint-disable-next-line
    emitter.removeListener( key, handle );
  }

  function handle() {
    func( get( key ), clear );
  }

  if ( value !== undefined ) {
    func( value, clear );
  } else if ( !always ) {
    emitter.once( key, handle );
  }

  if ( always ) {
    emitter.on( key, handle );
  }

  return { key, clear };
};

const watch = ( key, func ) => wait( key, func, false );

const dispense = ( key, value ) => {
  if ( key ) {
    if ( value !== undefined ) {
      set( key, value );
    }
    emitter.emit( key );
  }
};

const clear = () => {
  collection = new Map();
};

emitter.setMaxListeners( 1000 );

export default {
  set,
  get,
  getAll,
  wait,
  watch,
  dispense,
  clear
};

