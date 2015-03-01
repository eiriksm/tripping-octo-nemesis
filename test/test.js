var moment = require('moment');
var oct = require('../src/app');
oct.override({
  loginurl: 'http://localhost:9876',
  bookingurl: 'http://localhost:9876',
  frontpageUrl: 'http://localhost:9876/front'
});

// Override log mechanism for prettier test output.
oct.app.log = {
  log: function() {},
  error: function(){}
};
oct.app.l = oct.app.log;

// Answer something generic to the request.
var response = function (req, res) {
  if (req.url !== '/front') {
    return jsonResponse(req, res);
  }
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end("<html><body><script type='text/javascript'>" +
					'/* <![CDATA[ */\n' +
						'var brp_ajax_object = {"ajax_url":"http:\/\/3t.no\/wp-admin\/admin-ajax.php","security":"dddbce0acc"};\n' +
					'/* ]]> */\n' +
				'</script>Hello World</body></html>');
};

var jsonResponse = function(req, res) {
  var m = moment().day(1);
  if (m.unix() < moment().unix()) {
    m.add(7, 'days');
  }
  var day = m.format('YYYY-MM-DD');
  res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
  var respond = {
    data: {
      data: {},
      order_id: 123,
      gyms: {
        1: 'test'
      }
    }
  };
  respond.data.data[day] = {
    '19:30': {
      test: {
        court_id: 5,
        end: "09:30",
        gym_id: 1,
        product_id: 352,
        resource_requirement_id: 348,
        start: "09:00"
      }
    },
    '20:00': {
      test: {
        court_id: 5,
        end: "09:30",
        gym_id: 1,
        product_id: 352,
        resource_requirement_id: 348,
        start: "09:00"
      }
    }
  };
  res.end(JSON.stringify(respond));
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

  it('Should go all the way through, if we start up a server', function(done) {
    testserver = require('http').createServer(response).listen(9876, '127.0.0.1');
    oct.start({
      username: 'bogus',
      dayOfWeek: 1,
      businessUnit: 1,
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
      res.end(JSON.stringify('//@todo write a proper response here'));
    };
    testserver.close();
    testserver = require('http').createServer(response).listen(9876, '127.0.0.1');
    var st = require('../src/modules/status.js');
    var r = require('request');
    st.overrideUrl('http://localhost:9876/status');
    var opts = {
      request: r,
      security: 123
    };
    st.getStatus(opts, function(e, rs) {
      e.should.not.equal(null);
      should(rs).equal(undefined);
      st.getStatus(opts, function(err, res) {
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
      ub({request: r, id: 123, security: 123, url: 'http://localhost:9876/status'}, function(b, c) {
        b.should.not.equal(null);
        // and then things should be a-ok.
        ub({
          request: r,
          id: 123,
          url: 'http://localhost:9876/status',
          security: 123
        }, function(d, e, f) {
          should(d).equal(null);
          done();
        });
      });
    });
  });
});
