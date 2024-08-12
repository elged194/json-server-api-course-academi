const jsonServer = require('json-server');
// const auth = require('json-server-auth');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.db = router.db;

const rules = auth.rewriter({
  products: 777,
  users: 777,
});

server.use(middlewares);
server.use(rules);
// server.use(auth);
server.use(router);

server.listen(4000, () => {
  console.log('JSON Server is running on port 4000');
});
