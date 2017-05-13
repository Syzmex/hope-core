

import is, { property, kindOf } from './is';
import { HOPE_ACTION, invariant } from './utils';

export default function middlewareFactory( _options = {}) {
  const getHandler = property( 'handler' );
  const isHopeAction = property( HOPE_ACTION );
  return store => next => action => {
    if ( isHopeAction( action )) {
      const handler = getHandler( action );
      invariant(
        is.Function( handler ),
        `Hope: Expecting handler of ${action.type} is a function in instanceof check, but got ${kindOf( handler )}`
      );
      handler( store, action );
    }
    return next( action );
  };
}

