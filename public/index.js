/*
 * @flow
 */

import 'babel-polyfill';
import * as hope from '../src';

console.log( hope );

const { Ajax } = hope;

const ajax = Ajax( '/cui/do/admin/public/soft/about.do' ).then(( a ) => {
  console.log(typeof a)
  // alert( 1 );
  // alert( typeof a );
}).catch(( ...b ) => {
  // alert( b );
  // alert( ...b );
});