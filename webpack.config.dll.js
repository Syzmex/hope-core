
import { paths, loaders, plugins, combine } from 'kiwiai'; // eslint-disable-line

const appBuild = paths.dllNodeModule;
const pkg = require( paths.appPackageJson ); // eslint-disable-line
const dependencyNames = Object.keys( pkg.dependencies );

export default {
  entry: {
    dlls: dependencyNames
  },
  output: {
    path: appBuild,
    filename: '[name].js',
    library: '[name]'
  },
  plugins: plugins.DllPlugin(),
  resolve: {
    modules: [
      paths.ownNodeModules,
      paths.appNodeModules
    ],
    extensions: [ '.js', '.json' ]
  }
};
