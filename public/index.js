/*
 * @flow
 */

import * as hope from '../src';

console.log( hope );

const { Ajax } = hope;

const ajax = Ajax( '/do/config.json' ).then(( ...a ) => {
  console.log( a );
}).catch(( ...b ) => {
  console.log( ...b );
});