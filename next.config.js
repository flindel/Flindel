const withCSS = require('@zeit/next-css');
const webpack = require('webpack');
const isProd = process.env.NODE_ENV === 'production'

const apiKey = JSON.stringify(process.env.SHOPIFY_API_KEY);

function HACK_removeMinimizeOptionFromCssLoaders(config) {
  console.warn(
    'HACK: Removing `minimize` option from `css-loader` entries in Webpack config',
  );
  config.module.rules.forEach(rule => {
    if (Array.isArray(rule.use)) {
      rule.use.forEach(u => {
        if (u.loader === 'css-loader' && u.options) {
          delete u.options.minimize;
        }
      });
    }
  });
}

module.exports = withCSS({
  assetPrefix: isProd ? '' : 'https://primo.serveo.net',
  webpack(config) {
    HACK_removeMinimizeOptionFromCssLoaders(config);
    const env = { API_KEY: apiKey };
    config.output.publicPath = '_next${config.output.publicPath}';
    config.plugins.push(new webpack.DefinePlugin(env));

    return config;
  },
});
