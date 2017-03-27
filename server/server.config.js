

export default {
  react: false,
  port: 8000,
  entry: '',
  theme: '',
  hash: false,
  multipage: true,
  fileHash: '[name].[hash:4].[ext]',
  localCssHash: '[local]___[hash:base64:5]',
  staticFileHash: '[name].[hash:4].[ext]',
  disableCSSModules: false,
  extraPostCSSPlugins: [],
  extraBabelPlugins: [],
  autoprefixer: '',
  externals: '',
  define: [],
  svgSpriteLoaderDirs: '',
  proxy: {
    '/api': {
      target: 'http://192.168.1.6:8020',
      changeOrigin: true,
      pathRewrite: { '^/api': '' }
    }
  },
  webpack: ''
};

