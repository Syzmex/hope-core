

import { existsSync } from 'fs';
import { join, relative } from 'path';


export default function ( svConfig, webpackConfig, svWebpackConfig, paths, env, cwd ) {
  const webpackCfg = paths.resolveApp( webpackConfig )
  const svWebpackCfg = paths.resolveServer( svWebpackConfig );
  const config = require( svWebpackCfg )( svConfig, paths, cwd );
  if ( existsSync( webpackCfg ) ) {
    return require( webpackCfg )( config, env );  // eslint-disable-line
  } else {
    return config;
  }
}




