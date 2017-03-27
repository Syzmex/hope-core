'use strict';


import { resolve } from 'path';
import { realpathSync } from 'fs';


function resolveOwn ( relativePath ) {
  return resolve( __dirname, relativePath );
}


export default function getPaths ( cwd ) {
  const appDirectory = realpathSync( cwd );
  const serverDirectory = resolve( __dirname, '../' );

  function resolveApp ( relativePath ) {
    return relativePath && typeof relativePath === 'string'
      ? resolve( appDirectory, relativePath ) : '';
  }

  function resolveServer ( relativePath ) {
    return relativePath && typeof relativePath === 'string'
      ? resolve( serverDirectory, relativePath ) : '';
  }

  return {
    appSrc: resolveApp( 'src' ),
    appBuild: resolveApp( 'dist' ),
    appPublic: resolveApp( 'public' ),
    appServer: serverDirectory,
    appPackageJson: resolveApp( 'package.json' ),
    appNodeModules: resolveApp( 'node_modules' ),
    ownNodeModules: resolveOwn( '../../node_modules' ),
    resolveApp,
    resolveServer,
    appDirectory,
  };
}

