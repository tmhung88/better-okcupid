const Koa = require('koa');
const routes = require('./routes');

const app = new Koa();
const PORT = 5000;

app.use(routes.routes());

const server = app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});

module.exports = server;