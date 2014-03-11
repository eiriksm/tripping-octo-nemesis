var oct = require('..');
var should = require('should');

describe('Test the module', function() {
  it('Should not init without a config', function(done) {
    var result = oct.init({});
    result.should.equal(false);
    done();
  });
});
