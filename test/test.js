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

// Answer something generic to the request.
var response = function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(JSON.stringify('Hello World\n'));
};
var testserver;

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
    oct.start({username: 'bogus'}, false, function(err, res) {
      err.should.be.instanceOf(Object);
      done();
    });
  });

  it('Should go all the way throught, if we start up a server', function(done) {
    testserver = require('http').createServer(response).listen(9876, '127.0.0.1');
    oct.start({
      username: 'bogus',
      dayOfWeek: 1,
      times: [
        '19:30',
        '20:00'
      ]
    }, true, function(err, res) {
      should(err).equal(undefined);
      done();
    });
  });

  it('Should be possible to get status too.', function() {
    oct.status.should.be.instanceOf(Function);
    // Just call it too, so we are increasing test coverage.
    oct.status();
  });

  it('Should return expected response on get status', function(done) {
    // First override server response. One bad, one good.
    var count = 0;
    response = function(req, res) {
      if (count === 0) {
        count++;
        req.socket.destroy();
        return;
      }
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('<html><body class="my_booked_activitites"><table><tr><td>1</td><td>2</td><td>3</td><td>4</td></tr><tr><td>1</td><td>2</td><td>3</td><td>4</td></tr></table></body></html>');
    };
    testserver.close();
    testserver = require('http').createServer(response).listen(9876, '127.0.0.1');
    var st = require('../src/modules/status.js');
    var r = require('request');
    st.overrideUrl('http://localhost:9876/status');
    st.getStatus(r, function(e, rs) {
      e.should.not.equal(null);
      should(rs).equal(undefined);
      st.getStatus(r, function(err, res) {
        res.length.should.equal(2);
        res[0].length.should.equal(4);
        res[1][2].should.equal('3');
        done(err);
      });
    });
  });

  it('Should be possible to unbook something', function(done) {
    var count = 0;
    response = function(req, res) {
      if (count === 0) {
        count++;
        req.socket.destroy();
        return;
      }
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('is res');
    };
    testserver.close();
    testserver = require('http').createServer(response).listen(9876, '127.0.0.1');
    var ub = require('../src/modules/unbook.js');
    var r = require('request');
    ub(undefined, function(a) {
      // Should throw on no id.
      a.should.not.equal(null);
      ub({request: r, id: 123, url: 'http://localhost:9876/status'}, function(b, c) {
        a.should.not.equal(null);
        // and then things should be a-ok.
        ub({
          request: r,
          id: 123,
          url: 'http://localhost:9876/status'
        }, function(d, e, f) {
          should(d).equal(null);
          f.should.equal('is res');
          // And then for coverage:
          ub({
            request: function(obj, cb) {cb('hello');},
            id: 123
          }, function(q) {
            should(q).equal('hello');
            // And again for coverage.
            ub({
              url: 'http://localhost:9876/status',
              id: 123
            }, function(r, t, y) {
              done(r);
            });
          });
        });
      });
    });

  });
});
