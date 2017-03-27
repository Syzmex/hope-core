

export default function getSVGLoaders ( {
  svgSpriteLoaderDirs,
  staticFileHash
} ) {

  const baseSvgLoader = {
    test: /\.svg$/,
    use: [ {
      loader: 'file',
      query: {
        name: `static/${staticFileHash}`
      }
    } ]
  };

  const spriteSvgLoader = {
    test: /\.(svg)$/i,
    loader: 'svg-sprite',
  };

  if ( svgSpriteLoaderDirs ) {
    baseSvgLoader.exclude = config.svgSpriteLoaderDirs;
    spriteSvgLoader.include = config.svgSpriteLoaderDirs;
    return [
      baseSvgLoader,
      spriteSvgLoader,
    ];
  }
  else {
    return [ baseSvgLoader ];
  }
}

