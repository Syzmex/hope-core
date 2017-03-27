#!/usr/bin/env node


require( './utils/registerBabel' );
var fork = require( 'child_process' ).fork;

function start () {
  var p = fork( __dirname + '/index', process.argv.slice( 2 ) );
  p.on( 'message', function ( data ) {
    if ( data === 'RESTART' ) {
      p.kill( 'SIGINT' );
      start();
    }
  } );
}

if ( !process.send ) {
  start();
} else {
  require( './server' );
}

