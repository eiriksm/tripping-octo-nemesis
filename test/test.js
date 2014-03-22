var oct = require('../src/app');
oct.override({
  loginurl: 'http://localhost:9876',
  bookingurl: 'http://localhost:9876'
});

// Override log mechanism for prettier test output.
oct.app.log = {
  log: function() {},
  error: function(){}
};
oct.app.l = oct.app.log;

var should = require('should');

describe('Config', function() {

  it('Should not init without a config', function() {
    var result = oct.init({});
    result.should.equal(false);
  });

  it('Should init with a config', function() {
    var result = oct.init({username: 'bogus'});
    result.should.equal(true);
  });
});

describe('Requests', function() {

  it('Should try to go to first function in callback series, but fail', function(done) {
    oct.start({username: 'bogus'}, function(err, res) {
      err.should.be.instanceOf(Object);
      done();
    });
  });

  it('Should go all the way throught, if we start up a server', function(done) {
    require('http').createServer(function (req, res) {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end(JSON.stringify('Hello World\n'));
    }).listen(9876, '127.0.0.1');
    oct.start({
      username: 'bogus',
      dayOfWeek: 1,
      times: [
        '19:30',
        '20:00'
      ]
    }, function(err, res) {
      should(err).equal(null);
      done();
    });
  });
});
