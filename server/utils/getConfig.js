

import { existsSync } from 'fs';

export default function getConfig ( configFile, paths ) {
  const pathToConfig = paths.resolveServer( configFile );
  if ( existsSync( pathToConfig ) ) {
    return require( pathToConfig );  // eslint-disable-line
  } else {
    return {};
  }
}

