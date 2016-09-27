import express from 'express';
import proxy from 'proxy-middleware';
import url from 'url';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

import assets from './build/webpack-stats.json';

export const server = (options) => {
  const app = express();
  app.set('view engine', 'pug');

  //
  // Setup
  //

  // Return the URL to an asset.
  app.locals.assetBundle = (name, type) => {
    if (process.env.NODE_ENV !== "production") {
      // Dev: WebpackDevServer.
      return `http://localhost:${options.webpackPort}/build/${name}.${type}`
    } else {
      // Prod: read asset path from webpack-stats.json.
      for (let i = 0; i < assets.chunks[name].length; i++) {
        let publicPath = assets.chunks[name][i].publicPath;
        if (publicPath.substring(publicPath.length - type.length) === type) {
          return publicPath;
        }
      }
    }
    throw new Error(`Can't find asset for ${name}, ${type}`);
  }
  app.locals.options = options;

  //
  // Routes
  //

  // Static assets. In prod, this should be obviated by serving these directly
  // from the webserver (e.g. nginx).
  app.use('/build', express.static("build"));

  app.get('/', (req, res) => res.render('index'));

  app.get('/participate/:conferenceId', (req, res) => {
    return res.render('video', {
      'conferenceId': req.params.conferenceId,
      'mode': 'participate',
    })
  });

  app.get('/listen/:conferenceId', (req, res) => {
    return res.render('video', {
      'conferenceId': req.params.conferenceId,
      'mode': 'listen',
    });
  });

  // Dev: Start webpack dev server.
  if (process.env.NODE_ENV !== "production") {
    let webpackDevServer = new WebpackDevServer(
      webpack(require('./webpack/config.dev.js')),
      {
        contentBase: 'client',
        hot: true,
        inline: true,
        historyApiFallback: true,
        quiet: false,
        noInfo: false,
        publicPath: '/build/',
        stats: {colors: true}
      }
    );
    webpackDevServer.listen(options.webpackPort, "localhost", function() {});
  }

  // Start node server (prod and dev).
  app.listen(options.port)
}
