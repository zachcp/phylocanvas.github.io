const webpack = require('webpack');
const StaticSiteGeneratorPlugin = require('static-site-generator-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';
const paths = [
  '/',
  '/docs/',
  '/docs/quick-start/',
  '/docs/migrating-from-1x/',
];

module.exports = {

  devtool: isProd ? null : '#eval-source-map',

  entry: {
    main: isProd ?
      './src/index.js' : [
        'webpack-hot-middleware/client',
        './src/index.js',
      ],
  },

  module: {
    loaders: [
      isProd ?
        { test: /.css$/, loader: ExtractTextPlugin.extract('css!postcss') } :
        { test: /.css$/, loaders: [ 'style', 'css', 'postcss' ] },
      { test: /\.(png|jpg|jpeg|gif)$/, loader: 'file' },
      { test: /\.js$/,
        loader: 'babel',
        query: {
          presets: [ 'react', 'es2015', 'stage-0' ],
          plugins: isProd ? [] : [
            [ 'react-transform', {
              transforms: [ {
                transform: 'react-transform-hmr',
                imports: [ 'react' ],
                locals: [ 'module' ],
              }, {
                transform: 'react-transform-catch-errors',
                imports: [ 'react', 'redbox-react' ],
              } ],
            } ],
          ],
        },
        include: /src/,
      },
      { test: /\.json$/, loader: 'json' },
    ],
  },

  output: {
    filename: 'index.js',
    path: __dirname,
    /* IMPORTANT!
     * You must compile to UMD or CommonJS
     * so it can be required in a Node context: */
    libraryTarget: 'umd',
  },

  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),
    new StaticSiteGeneratorPlugin('main', paths, null),
  ].concat(isProd ? [
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new ExtractTextPlugin('styles.css'),
  ] : [
    new webpack.HotModuleReplacementPlugin(),
  ]),

  postcss() {
    return [ require('postcss-cssnext') ];
  },
};
