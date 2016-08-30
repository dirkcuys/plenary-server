import express from 'express';
import proxy from 'proxy-middleware';
import url from 'url';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

import assets from './build/webpack-stats.json';

export const server = (options) => {
  const app = express();
  app.set('view engine', 'pug');

  app.use('/build', express.static("build"));

  app.locals.assetBundle = (name, type) => {
    if (process.env.NODE_ENV !== "production") {
      return `http://localhost:${options.webpackPort}/build/${name}.${type}`
    } else {
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

  if (process.env.NODE_ENV !== "production") {
    let webpackDevServer = new WebpackDevServer(
      webpack(require('./webpack/config.dev.js')),
      {
        contentBase: 'client',
        hot: true,
        quiet: false,
        noInfo: false,
        publicPath: '/build/',
        stats: {colors: true}
      }
    );
    webpackDevServer.listen(options.webpackPort, "localhost", function() {});
  }

  app.listen(options.port)
}
