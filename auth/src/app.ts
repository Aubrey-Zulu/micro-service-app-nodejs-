import cookieSession from 'cookie-session';
import express from 'express';
import 'express-async-errors';

import morgan from 'morgan';

import { NotFoundError } from './errors/not-found-error';
import { errorHandler } from './middlewares/error-handler';
import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';

const app = express();
app.set('trust proxy', true);

app.use(express.json());
app.use(morgan('dev'));
app.use(
  cookieSession({
    signed: false,
    secure: true,
  })
);
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

// Not found handler

app.all('*', async () => {
  throw new NotFoundError();
});
// error handling middleware
app.use(errorHandler);

export { app };
