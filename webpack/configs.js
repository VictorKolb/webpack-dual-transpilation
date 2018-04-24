const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const currentBundles = require('./bundles_list.js');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const NODE_ENV = process.env.NODE_ENV || 'development';

const configureBabelLoader = (browserList) => (
  {
    test: /\.jsx?/,
    loader: 'babel-loader',
    options: {
      babelrc: false,
      presets: [
        ['env', {
          modules: false,
          useBuiltIns: true,
          targets: {
            browsers: browserList,
          },
        }],
      ],
    },
  }
);

const production = {
  mode: 'production',
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        sourceMap: true,
        uglifyOptions: {
          compress: {
            inline: false,
          },
        },
      }),
    ],
  },
};

const development = {
  mode: 'development',
  devtool: 'source-map',
};

const common = {
  context: path.resolve(`${__dirname}/../dev`),

  resolve: {
    modules: [path.resolve(`${__dirname}/../dev`), 'node_modules'],
    extensions: ['.js', '.jsx'],
  },

  output: {
    filename: '[name].js',
    path: path.resolve(`${__dirname}/../build`),
  },

  plugins: [
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify(NODE_ENV),
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
    }),
  ],

  optimization: {
    runtimeChunk: false,
    splitChunks: {
      cacheGroups: {
        default: false,
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor_app',
          chunks: 'all',
          minChunks: 2,
        },
      },
    },
  },
};

const modernConfig = merge([
  common,
  NODE_ENV === 'production' ? production : development,
  {
    plugins: [
      new webpack.DefinePlugin({
        MODE_BUNDLE: JSON.stringify('modern'),
      }),
    ],
    module: {
      rules: [
        configureBabelLoader([
          // The last two versions of each browser, excluding versions
          // that don't support <script type="module">.
          'last 2 Chrome versions', 'not Chrome < 60',
          'last 2 Safari versions', 'not Safari < 10.1',
          'last 2 iOS versions', 'not iOS < 10.3',
          'last 2 Firefox versions', 'not Firefox < 54',
          'last 2 Edge versions', 'not Edge < 15',
        ]),
      ],
    },
  },
]);

const legacyConfig = merge([
  common,
  NODE_ENV === 'production' ? production : development,
  {
    output: {
      filename: '[name]_legacy.js',
    },
    plugins: [
      new webpack.DefinePlugin({
        MODE_BUNDLE: JSON.stringify('legacy'),
      }),
    ],
    module: {
      rules: [
        configureBabelLoader([
          'last 5 versions',
        ]),
      ],
    },
  },
]);

function configMaker(env, config) {
  const bundles = [];
  bundles.push(...Object.values(currentBundles));

  return merge([config, ...bundles]);
}


module.exports.modern = (env) => configMaker(env, modernConfig);
module.exports.legacy = (env) => configMaker(env, legacyConfig);
