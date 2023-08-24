import path from 'path';
import helmet from 'helmet';
import { Store } from 'express-session';
import { configure, Plan, waypointUrl } from "@dwp/govuk-casa";
import express, { NextFunction, Request, Response } from 'express';

import nameFields from './fields/name';
import biographyFields from './fields/biography';

const subApp = (
  name: string,
  secret: string,
  ttl: number,
  secure: boolean,
  store: Store,
) => {
  const casaApp = express();
  casaApp.use(helmet.noSniff());

  const viewDir = path.join(__dirname, './views/');
  const localesDir = path.join(__dirname, './locales/');

  const plan = new Plan();
  plan.addSequence('name', 'biography', 'url:///start/');

  const { mount, ancillaryRouter } = configure({
    views: [viewDir],
    i18n: {
      dirs: [localesDir],
      locales: ['en'],
    },
    session: {
      name,
      secret,
      ttl,
      secure,
      store,
    },
    pages: [
      {
        waypoint: 'name',
        view: 'pages/name.njk',
        fields: nameFields
      },
      {
        waypoint: 'biography',
        view: 'pages/biography.njk',
        fields: biographyFields,
      }
    ],
    hooks: [{
      hook: 'journey.prerender',
      middleware: (req: Request, res: Response, next: NextFunction) => {
        console.log(`About to render ${req.path} ...`);
        console.log(`Sub App ${name} Session ID: ${req.sessionID}`);
        next();
      },
    }],
    plan
  });

  ancillaryRouter.use('/start', (req: Request, res: Response) => {
    const str = (req as any).session.journeyContextList;
    console.log(JSON.stringify(str[0][1].data, null, 4));
    // console.log(JSON.stringify(str[0][1].data.name.name, null, 4));
    // console.log(JSON.stringify(str[0][1].data.biography.biography));
    res.render('pages/start.njk');
  });

  return mount(casaApp, {});
}

export default subApp;
