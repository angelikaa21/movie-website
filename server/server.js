require('@babel/register');
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userEndpoint = require('./REST/user.endpoint').default;

const routes = require('./REST/routes').default;

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connection with MongoDB successful!');
}).catch(err => {
  console.error('Failed to connect with MongoDB: ', err);
});

const router = express.Router();
routes(router);
app.use(router);

userEndpoint(router);
app.use('/api/user', router);

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
