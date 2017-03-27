

import { resolve } from 'path';


export default function getTheme ( { theme }, cwd ) {
  if ( theme ) {
    if ( typeof theme === 'string' ) {
      const themeFile = resolve( cwd, theme );
      const themeConfig = require( themeFile );  // eslint-disable-line
      return typeof themeConfig === 'function' ? themeConfig() : themeConfig;
    } else {
      return theme;
    }
  }
  return {};
}

