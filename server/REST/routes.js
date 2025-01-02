import userEndpoint from './user.endpoint.js';
import auth from '../middleware/auth.js';

const routes = (router) => {

  router.get('/public', (req, res) => {
    res.json({ message: 'This is a public route' });
  });

  router.get('/protected', auth, (req, res) => {
    res.json({
      message: 'Access granted to protected route',
      user: req.user,
    });
  });

  userEndpoint(router);
};

export default routes;