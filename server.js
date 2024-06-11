const cors = require('@koa/cors');
const Koa = require('koa');
const logger = require('koa-logger');
const serve = require('koa-static');

const app = new Koa();

app.use(logger());
app.use(cors({
  maxAge: 86400,
  credentials: true,
}));
app.use(serve('./dist'));

const PORT = 4449;

app.listen(PORT);

// eslint-disable-next-line
console.log(`Listening on ${PORT}`);
// eslint-disable-next-line
console.log(`http://localhost:${PORT}`);
