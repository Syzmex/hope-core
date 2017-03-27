

import getTheme from './getTheme';





export default function getCSSLoaders ( config, cwd ) {

  const own = [];
  const nodeModules = [];
  const { cssHashName } = config;
  const theme = JSON.stringify( getTheme( config, cwd ) );
  const localIdentName = cssHashName || '[local]_[sha512:hash:base64:5]';
  const less = `less?{"modifyVars":${theme}}`;
  const css = {
    loader: 'css',
    query: {
      importLoaders: 1
    }
  };

  function CSSModules ( css ) {
    return {
      loader: 'css',
      query: {
        ...css.query,
        modules: true,
        localIdentName
      }
    };
  }

  own.push( 'style' );
  nodeModules.push( 'style' );

  if ( config.disableCSSModules ) {
    own.push( css );
  } else {
    own.push( CSSModules( css ) );
  }
  nodeModules.push( css );

  own.push( 'postcss' );
  own.push( less );
  nodeModules.push( 'postcss' );
  nodeModules.push( less );

  return {
    own,
    nodeModules,
  };
}

