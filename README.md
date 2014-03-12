tripping-octo-nemesis
=====================
[![Build Status](https://secure.travis-ci.org/eiriksm/tripping-octo-nemesis.png)](http://travis-ci.org/eiriksm/tripping-octo-nemesis)
[![Code Climate](https://codeclimate.com/github/eiriksm/tripping-octo-nemesis.png)](https://codeclimate.com/github/eiriksm/tripping-octo-nemesis)

I love choosing repo names from suggestions

Module to book stuff from 3t. Note that this does not use any "official" API, so
you should use at your own risk.

## Setup
- Install the required modules (`npm install`)
- Copy the file `default.config.yml` to `config.yml` and run with `node
index.js`

## Requirements
- Node.js
- npm

## Settings
You should look up what business unit you want to book. Other settings should
be self-explanatory (Just remember that sunday = day 0 and saturday = day 6).

At the time of writing, these are the businessUnit codes:
- 3t Rosten: __1__
- 3t Leanger: __2__
- 3t Steinkjer: __5__
- 3t Sluppen: __6__

## Run weekly with cron.
- Edit your crontab (for example with `crontab -e`)
- Add the following line (used for booking on fridays):
```01 08 * * 5 node /path/to/script/index.js > /dev/null```

## Contribute
Contributions are welcome, although I would be pleasantly surprised :)

Remember to run all tests with `make test`

## Licence
[WTFPL](http://en.wikipedia.org/wiki/WTFPL)
