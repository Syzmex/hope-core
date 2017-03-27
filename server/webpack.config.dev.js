

import webpack from 'webpack';
import { existsSync } from 'fs';
import autoprefixer from 'autoprefixer';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import SystemBellWebpackPlugin from 'system-bell-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import WatchMissingNodeModulesPlugin from 'react-dev-utils/WatchMissingNodeModulesPlugin';
import getEntry from './utils/getEntry';
import getCSSLoaders from './utils/getCSSLoaders';
import getSVGLoaders from './utils/getSVGLoaders';
import stringifyDefine from './utils/stringifyDefine';


export default function ( config, paths, cwd ) {

  const publicPath = '/';
  const cssLoaders = getCSSLoaders( config, cwd );
  const defaultFileHash = '[name].[hash:8].[ext]';
  const staticFileHash = config.staticFileHash || defaultFileHash;
  const svgLoaders = getSVGLoaders( { ...config, staticFileHash } );

  return {
    devtool: 'cheap-module-source-map',
    entry: getEntry( config, paths.appDirectory ),
    output: {
      path: paths.appBuild,
      filename: '[name].js',
      pathinfo: true,
      publicPath
    },
    resolve: {
      modules: [
        paths.ownNodeModules,
        paths.appNodeModules
      ],
      extensions: [
        '.web.js', '.web.jsx', '.web.ts', '.web.tsx',
        '.js', '.json', '.jsx', '.ts', '.tsx'
      ]
    },
    resolveLoader: {
      moduleExtensions: [ '-loader' ]
    },
    module: {
      rules: [ {
        exclude: [
          /\.html$/,
          /\.(js|jsx)$/,
          /\.(css|less)$/,
          /\.json$/,
          /\.svg$/,
          /\.tsx?$/
        ],
        loader: 'url',
        query: {
          limit: 10000,
          name: `static/${staticFileHash}`
        }
      }, {
        test: /\.(js|jsx)$/,
        include: paths.appSrc,
        loader: 'babel'
      }, {
        test: /\.css$/,
        include: paths.appSrc,
        loader: cssLoaders.own
      }, {
        test: /\.less$/,
        include: paths.appSrc,
        loader: cssLoaders.own
      }, {
        test: /\.css$/,
        include: paths.appNodeModules,
        loader: cssLoaders.nodeModules
      }, {
        test: /\.less$/,
        include: paths.appNodeModules,
        loader: cssLoaders.nodeModules
      }, {
        test: /\.html$/,
        loader: 'file',
        query: { name: '[name].[ext]' }
      }, {
        test: /\.svg$/,
        loader: 'file',
        query: {
          name: `static/${staticFileHash}`
        }
      } ].concat( svgLoaders )
    },
    plugins: [
      new webpack.DefinePlugin( {
        'process.env': {
          NODE_ENV: JSON.stringify( process.env.NODE_ENV ),
        }
      } ),
      new webpack.LoaderOptionsPlugin( {
        options: {
          babel: {
            babelrc: false,
            presets: [
              [ require.resolve( 'babel-preset-es2015' ), { modules: false }],
              require.resolve( 'babel-preset-react' ),
              require.resolve( 'babel-preset-stage-0' )
            ],
            plugins: [].concat(
              config.react ? require.resolve( 'babel-plugin-react-require' ) : []
            ).concat( config.extraBabelPlugins || [] ),
            cacheDirectory: true
          },
          postcss () {
            return [
              autoprefixer( config.autoprefixer || {
                browsers: [
                  '>1%',
                  'last 4 versions',
                  'Firefox ESR',
                  'not ie < 9' // React doesn't support IE8 anyway
                ]
              } )
            ].concat( config.extraPostCSSPlugins || [] );
          }
        }
      } ),
      new webpack.HotModuleReplacementPlugin(),
      new CaseSensitivePathsPlugin(),
      new WatchMissingNodeModulesPlugin( paths.appNodeModules ),
      new SystemBellWebpackPlugin()
    ].concat(
      !existsSync( paths.appPublic ) ? [] :
        new CopyWebpackPlugin( [ {
          from: paths.appPublic,
          to: paths.appBuild
        } ] )
    ).concat(
      !config.multipage ? [] :
        new webpack.optimize.CommonsChunkPlugin( { name: 'common', filename: 'common.js' } )
    ).concat(
      !config.define ? [] :
        new webpack.DefinePlugin( stringifyDefine( config.define ) )
    ),
    externals: config.externals,
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty'
    }
  };
}
