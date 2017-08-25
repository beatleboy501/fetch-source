/** @module Server */
var http = require('http');
var request = require('request');

/** The express framework is used for routing */
const express = require('express');
const app = express();
app.enable("jsonp callback");
const apiRoutes = express.Router();

/** The port used. Default is 8080 */
const port = process.env.PORT || 8080;

/** Add middleware to the app router */
app.use(express.static('.'));
app.use('.', express.static('.'));

/** App routes */

/** @name <b> / </b> - The home route will bring up the home page
 * app.get
 * @function
 */
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

apiRoutes.get('/requestSource', function (req, res) {
  request(req.query.url, function (err, resp, html) {
    if (err) {
      console.error(err.message);
      res.status(400).send(err.message);
    } else {
      try {
        var body = html.split('<body>').pop().split('</body>')[0]; // Omit <head> content, etc.
        res.send(body);
      } catch (err) {
        console.error(err.message);
        res.status(400).send(err.message);
      }
    }
  });

});

app.use('/api', apiRoutes);
app.listen(port);
