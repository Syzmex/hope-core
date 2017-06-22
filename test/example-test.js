

/* globals describe:true it:true */
// import expect from 'expect';

// // test example
// import { add } from '../src/utils/add';

var expect = require('expect');
var utils = require('../src/utils/add');
var add = utils.add;
var multiply = utils.multiply;

// 函数测试
describe( '#utils', function () {

  describe( '#add()', function () {
    it( '加法1', function () {
      expect( add( 1, 2 ) ).toEqual( 3 );
    } );
    it( '加法2', function () {
      expect( add( 6, 7 ) ).toEqual( 13 );
    } );
  } );

  describe( '#multiply()', function () {
    it( '乘法1', function () {
      expect( multiply( 1, 2 ) ).toEqual( 2 );
    } );
    it( '乘法2', function () {
      expect( multiply( 6, 7 ) ).toEqual( 42 );
    } );
  } );

} );
