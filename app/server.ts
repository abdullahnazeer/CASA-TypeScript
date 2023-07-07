import express from 'express';
import { noSniff } from 'helmet';
import path from 'path';

import app from "./app";

const expressApp = express();
expressApp.use(noSniff());

// we have to consider where these assets will live relative to the transpiled JS
expressApp.use('/assets/js', express.static(path.resolve(__dirname, './public/javascript')));
expressApp.use('/assets/images', express.static(path.resolve(__dirname, './public/images')));
expressApp.use('/assets/fonts', express.static(path.resolve(__dirname, './public/fonts')));
expressApp.use(express.static(path.resolve(__dirname, './public')));

const casaApp = app();

expressApp.use('/', casaApp);

expressApp.listen(3000, () => {
  console.log('running');
});
