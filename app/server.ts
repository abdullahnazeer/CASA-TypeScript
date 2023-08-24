import 'dotenv/config';
import path from 'path';
import { noSniff } from 'helmet';
import { MemoryStore } from 'express-session';
import { AppConfig } from 'environment';
import express, { NextFunction, Request, Response } from 'express';

const appConfig = { ...process.env as AppConfig };

// import RedisStore from "connect-redis"
// import session from "express-session"
// import {createClient} from "redis"

import subApp from './sub-app';

// // Initialize client.
// let redisClient = createClient({
//   password: '3kwEo1vye3kuozZ4zf4JoVhISDAA43eX',
//   socket: {
//     host: 'redis-19091.c3.eu-west-1-1.ec2.cloud.redislabs.com',
//     port: 19091
//   }
// })
// redisClient.connect().catch(console.error)

// // Initialize store.
// let redisStore = new RedisStore({
//   client: redisClient,
//   prefix: "srel:",
//   ttl: 60000,
// })

const expressApp = express();
expressApp.use(noSniff());

// expressApp.use(session({
//   secret: 'sample-srel',
//   cookie: { maxAge: 60000 },
//   store: new RedisStore({
//     client: redisClient,
//     prefix: "srel:",
//     ttl: parseInt(appConfig.SESSIONS_TTL_SECONDS),
//   }),
//   name: 'srel',
//   resave: false,
//   saveUninitialized: true
// }));

/**
 * we have to consider where these assets will live relative to the transpiled JS
 * 
 * for example, in the gulpfile the 'img' task moves all required images to '/dist/public/images'
 * this file (server.ts) will be transpiled into 'server.js' and will be located in '/dist/server.js'
 * now all the images are accessible to 'server.js' with the relative import './public/images' 
 */
expressApp.use('/css', express.static(path.resolve(__dirname, './public/css')));
expressApp.use('/assets/js', express.static(path.resolve(__dirname, './public/javascript')));
expressApp.use('/assets/images', express.static(path.resolve(__dirname, './public/images')));
expressApp.use('/assets/fonts', express.static(path.resolve(__dirname, './public/fonts')));

/**
 * since we are using TypeScript, we can declare a custom 'environment' module, which allows us to 
 * specify 'AppConfig' interface, which enables auto-suggestion for our environment variables 
 * 
 * this does mean that updating '.env' file will require updating the 'AppConfig' interface, 
 * which is located at '../typings/environment/index.d.ts' 
 */

const name = appConfig.SESSION_ID;
const secret = appConfig.SESSIONS_SECRET;
const ttl = parseInt(appConfig.SESSIONS_TTL_SECONDS);
const secure = appConfig.SECURE_COOKIES === 'true';
const casaMountUrl = appConfig.CASA_MOUNT_URL;
const port = parseInt(appConfig.SERVER_PORT);

const sessionStore = new MemoryStore();

const casaApp = subApp(name, secret, ttl, secure, sessionStore);

expressApp.get('/destroy', (req: Request, res: Response) => {
  const sid = req.query.sid as string;
  if (!sid) {
    res.status(400).send('sid is required');
    return;
  }

  sessionStore.destroy(sid, (err) => {
    if (err) {
      res.status(400).send(`failed to destroy session with sid ${sid}`);
      return;
    }

    res.send(`successfully destroyed session with sid ${sid}`);
  });
});

expressApp.use('/', casaApp);

expressApp.listen(port, () => {
  console.log(`running on port: ${port}`);
});
