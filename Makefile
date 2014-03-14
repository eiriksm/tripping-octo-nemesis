test-cov:
	- @NODE_ENV=test node --harmony ./node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha -- -d --recursive -R spec && cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js > /dev/null 2>&1

test:
		./node_modules/mocha/bin/mocha
		./node_modules/jshint/bin/jshint src

.PHONY: test
