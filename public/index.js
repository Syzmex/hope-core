/*
 * @flow
 */

import 'babel-polyfill';
import * as hope from '../src';

console.log( hope );

const { Ajax } = hope;

Ajax(() => {console.log("ajax:", 1)
  return Ajax( '/test.json' ).done(( data ) => {
    console.log("data:", data)
  }).done(( data ) => {
    console.log("data2:", data)
  });
}).ajax(() => {console.log("ajax:", 2)
  return Ajax( '/test2.json' ).done(( data ) => {
    console.log("data:", data)
  }).done(( data ) => {
    console.log("data2:", data)
  });
}).done(( ...data ) => {
  console.log("data3:", data)
}).catch(() => {
  console.log("111:", 111)
})/*.ajax(() => {
  return Ajax( '/test.json' ).done(( data ) => {
    console.log("data3:", data)
  });
}).done(() => {
  console.log("data4:", data)
});*/
// console.log(Ajax( '/test.json' ))
// const ajax = Ajax( '/test.json' ).before(( ...chains ) => {
//   console.log( 'before:', chains )
// }).then(( a ) => {
//   console.log( 'then1:', a );
//   return '1';
//   // console.log(typeof a)
//   // alert( 1 );
//   // alert( typeof a );
// }).then(( a ) => {
//   console.log( 'then1.1:', a );
//   // console.log(typeof a)
//   // alert( 1 );
//   // alert( typeof a );
// }).then(( a ) => {
//   console.log( 'then1.2:', a );
//   // console.log(typeof a)
//   // alert( 1 );
//   // alert( typeof a );
// }).catch(( b ) => {console.log(this);
//   // alert( b );
//   // alert( ...b );
// }).finally((...a) => {
//   console.log( 'finally1:',a )
// }).ajax(( json ) => {
//   console.log( 'json1:', json );
//   return Ajax( '/test2.json' );
// }).get(( json ) => {
//   console.log( 'json2:', json );
//   return Ajax( '/test2.json' );
// }).then(( a, b,c ) => {
//   console.log( 'then2:', a, b, c );
//   // console.log(typeof a)
//   // alert( 1 );
//   // alert( typeof a );
// }).get(( json ) => {
//   console.log( 'json2:', json );
//   return Ajax( '/test3.json' );
// }).then(( a, b,c ) => {
//   console.log( 'then2:', a, b, c );
//   // console.log(typeof a)
//   // alert( 1 );
//   // alert( typeof a );
// }).catch(( err ) => {console.log('catch:',err)
//   // alert( b );
//   // alert( ...b );
// }).finally((...a) => {
//   console.log( 'finally2:', a )
// });

// const fd = new FormData();
// fd.append( '2', 2 );
// Ajax( '/test.json', {
//   data: fd
// }).then();
// let promise = new Promise(function(resolve, reject) {
//   console.log('Promise');
//   resolve( 'yes' );
// });

// promise.then(function() {
//   console.log('Resolved.');
// }).catch((e) => {
//   console.log( 'catch!', e )
// }).then(( e ) => {
//   console.log(e)
// })

