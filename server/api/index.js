const auth = require('../auth');
const masquerade = require('./masquerade');
const localist = require('./localist');
const student = require('./student');

// Mount sub-routers onto /api/[resource-name]
module.exports = app => {
  app.use('/api/masquerade', auth.ensureAdmin, masquerade);
  app.use('/api/student', auth.ensureAuthenticated, student);
  app.use('/api/events', localist);
};
