

import Task from 'data.task';
import { Left, Right } from 'data.either';
import { chain, map } from 'control.monads';
import chalk from 'chalk';
import webpack from 'webpack';
import chokidar from 'chokidar';
import detect from 'detect-port';
import WebpackDevServer from 'webpack-dev-server';
import formatWebpackMessages from 'react-dev-utils/formatWebpackMessages';
import historyApiFallback from 'connect-history-api-fallback';
import compose from './utils/compose';
import getPaths from './utils/getPaths';
import getConfig from './utils/getConfig';
import clearConsole from './utils/clearConsole';
import getWebpackConfig from './utils/getWebpackConfig';


process.env.NODE_ENV = 'development';
const DEFAULT_PORT = 8000;
const SEVER_CONFIG = 'server.config.js';
const DEFAULT_WEBPACK_CONFIG = 'webpack.config.js';
const SEVER_WEBPACK_CONFIG = 'webpack.config.dev.js';
const defaultWatchFiles = [
  SEVER_CONFIG,
  DEFAULT_WEBPACK_CONFIG,
  `./utils/${SEVER_WEBPACK_CONFIG}`
];
const cwd = process.cwd();
const paths = getPaths( cwd );
const proxy = require( paths.appPackageJson ).proxy;  // eslint-disable-line
const server = {
  cwd,
  paths,
  proxy,
  port: DEFAULT_PORT,
  env: process.env.NODE_ENV,
  isInteractive: process.stdout.isTTY
};


function clearConsoleWrapped () {
  process.env.CLEAR_CONSOLE !== 'NONE' &&
  process.stdout.isTTY &&
  clearConsole();
}


// read config for develop server
function readSvConfig ( server ) {
  try {
    server.svConfig = getConfig( SEVER_CONFIG, paths );
    server.port = server.svConfig.port;
    return Right( server );
  } catch ( e ) {
    console.log();
    console.log( chalk.red( 'Failed to read server.config.js.' ) );
    console.log();
    console.log( e.message );
    console.log();
    return Left( null );
  }
}


// read config for webpack dev server
function readWebpackConfig ( server ) {
  try {
    server.wpConfig = getWebpackConfig(
      server.svConfig,
      server.svConfig.webpack || DEFAULT_WEBPACK_CONFIG,
      SEVER_WEBPACK_CONFIG,
      paths,
      server.env,
      server.cwd
    );
    return Right( server );
  } catch ( e ) {
    console.log();
    console.log( chalk.red( 'Failed to read webpack.config.dev.js.' ) );
    console.log();
    console.log( e.message );
    console.log();
    return Left( null );
  }
}


function setupCompiler ( server ) {

  const host = process.env.HOST || 'localhost';
  const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
  const { isInteractive, port, wpConfig } = server;
  const compiler = webpack( wpConfig );

  compiler.plugin( 'invalid', function () {
    console.log( 'Compiling...' );
  } );

  let isFirstCompile = true;
  compiler.plugin( 'done', function ( stats ) {

    clearConsoleWrapped();
    const messages = formatWebpackMessages( stats.toJson( {}, true ) );
    const isSuccessful = !messages.errors.length && !messages.warnings.length;
    const showInstructions = isSuccessful && ( isInteractive || isFirstCompile );

    if ( isSuccessful ) {
      console.log( chalk.green( 'Compiled successfully!' ) );
    }

    if ( showInstructions ) {
      console.log();
      console.log('The server is running at:');
      console.log();
      console.log( `  ${chalk.cyan( `${protocol}://${host}:${port}/` )}` );
      console.log();
      console.log( 'Note that the development build is not optimized.' );
      console.log( `To create a production build, use ${chalk.cyan( 'npm run build' )}.` );
      console.log();
      isFirstCompile = false;
    }

    // If errors exist, only show errors.
    if ( messages.errors.length ) {
      console.log( chalk.red( 'Failed to compile.' ) );
      console.log();
      messages.errors.forEach( function ( message ) {
        console.log( message );
        console.log();
      } );

    // Show warnings if no errors were found.
    } else if ( messages.warnings.length ) {

      console.log( chalk.yellow( 'Compiled with warnings.' ) );
      console.log();
      messages.warnings.forEach( function ( message ) {
        console.log( message );
        console.log();
      } );

      // Teach some ESLint tricks.
      console.log( 'You may use special comments to disable some warnings.' );
      console.log( `Use ${chalk.yellow('// eslint-disable-next-line')} to ignore the next line.` );
      console.log( `Use ${chalk.yellow('/* eslint-disable */')} to ignore all warnings in a file.` );
      console.log();
    }

    // if (isInteractive) {
    //   outputMockError();
    // }
  } );
  server.compiler = compiler;
  return server;
}



function addMiddleware ( server ) {
  const { proxy, devServer } = server;
  devServer.use( historyApiFallback( {
    disableDotRule: true,
    htmlAcceptHeaders: proxy ?
      [ 'text/html' ] :
      [ 'text/html', '*/*' ],
  } ) );
  // TODO: proxy index.html, ...
  devServer.use( devServer.middleware );
}


function setupWatch ( server ) {
  const { devServer, svConfig, paths } = server;
  const files = defaultWatchFiles.concat( paths.resolveApp( svConfig.theme ) || [] );
  const watcher = chokidar.watch( files, {
    ignored: /node_modules/,
    persistent: true,
  } );
  watcher.on( 'change', ( path ) => {
    console.log( chalk.green( `File ${path.replace( paths.appDirectory, '.' )} changed, try to restart server` ) );
    watcher.close();
    devServer.close();
    process.send( 'RESTART' );
  } );
  return server;
}


function runDevServer ( server ) {

  const host = process.env.HOST || 'localhost';
  const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
  const { compiler, port, wpConfig, svConfig } = server;
  const devServer = new WebpackDevServer( compiler, {
    compress: true,
    clientLogLevel: 'none',
    contentBase: paths.appPublic,
    hot: true,
    publicPath: wpConfig.output.publicPath,
    quiet: true,
    watchOptions: {
      ignored: /node_modules/,
    },
    https: protocol === 'https',
    host,
    proxy: svConfig.proxy || {},
  } );

  server.devServer = devServer;
  addMiddleware( server );
  // applyMock( devServer );

  devServer.listen( port, ( err ) => {

    if ( err ) {
      return console.log( err );
    }

    process.send( 'READY' );
    clearConsoleWrapped();
    console.log( chalk.cyan( 'Starting the development server...' ) );
    console.log();
    // if (isInteractive) {
    //   outputMockError();
    // }

  } );

  setupWatch( server );
  return server;
}


// 检查端口占用
function portChecker ( server ) {
  return new Task( function ( result ) {
    detect( server.port ).then( function ( port ) {
      if ( port === server.port ) {
        result( server );
      } else {
        console.log( chalk.yellow( `Something is already running on port ${port}.` ) );
      }
    } );
  } );
}


compose( chain( portChecker ), readSvConfig )( server ).fork(
  compose( map( runDevServer ), map( setupCompiler ), readWebpackConfig )
);

