import path from 'path';
import helmet from 'helmet';
import { MemoryStore } from 'express-session';
import { configure, Plan } from "@dwp/govuk-casa";
import express, { Request, Response } from 'express';

const app = () => {
  const casaApp = express();
  casaApp.use(helmet.noSniff());

  // !!IMPORTANT: this is ONLY for dev - MemoryStore is not suitable for PROD!
  const sessionStore = new MemoryStore();

  const viewDir = path.join(__dirname, './views/');
  const localesDir = path.join(__dirname, './locales/');

  const plan = new Plan();

  const { mount, ancillaryRouter } = configure({
    views: [viewDir],
    i18n: {
      dirs: [localesDir],
      locales: ['en'],
    },
    session: {
      name: 'app-name',
      secret: 'some-secret',
      ttl: 3600,
      secure: false,
      store: sessionStore,
    },
    pages: [
      {
        waypoint: 'start',
        view: 'pages/start.njk'
      }
    ],
    plan
  });

  ancillaryRouter.use('/start', (req: Request, res: Response) => {
    res.render('pages/start.njk');
  });

  return mount(casaApp, {});
}

export default app;
