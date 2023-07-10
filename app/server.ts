import express from 'express';
import { noSniff } from 'helmet';
import path from 'path';

import app from "./app";

const expressApp = express();
expressApp.use(noSniff());

/**
 * we have to consider where these assets will live relative to the transpiled JS
 * 
 * for example, in the gulpfile the 'img' task moves all required images to '/dist/public/images'
 * this file (server.ts) will be transpiled into 'server.js' and will be located in '/dist/server.js'
 * now all the images are accessible to 'server.js' with the relative import './public/images' 
 */
expressApp.use('/assets/js', express.static(path.resolve(__dirname, './public/javascript')));
expressApp.use('/assets/images', express.static(path.resolve(__dirname, './public/images')));
expressApp.use('/assets/fonts', express.static(path.resolve(__dirname, './public/fonts')));
expressApp.use('/css', express.static(path.resolve(__dirname, './public/css')));

const casaApp = app();

expressApp.use('/', casaApp);

expressApp.listen(3000, () => {
  console.log('running');
});
