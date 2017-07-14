/*
 * @flow
 */

import 'babel-polyfill';
import * as hope from '../src';

console.log( hope );

const { Ajax } = hope;

const ajax = Ajax( '/index.html' ).then(( a ) => {console.log(a)
  console.log(typeof a)
  // alert( 1 );
  // alert( typeof a );
}).catch(( b ) => {console.log(b)
  // alert( b );
  // alert( ...b );
});