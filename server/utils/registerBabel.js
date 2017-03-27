

if ( process.env.NODE_ENV !== 'test' ) {
  // eslint-disable-next-line
  require( 'babel-register' )({
    only: /(server\/|src\/)/,
    presets: [
      require.resolve( 'babel-preset-es2015' ),
      require.resolve( 'babel-preset-react' ),
      require.resolve( 'babel-preset-stage-0' )
    ],
    plugins: [
      require.resolve( 'babel-plugin-add-module-exports' )
    ],
    babelrc: false
  });
}

