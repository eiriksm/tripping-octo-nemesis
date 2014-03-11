tripping-octo-nemesis
=====================

I love choosing repo names from suggestions

Module to book stuff from 3t. Note that this does not use any "official" API, so
you should use at your own risk.

## Setup
Copy the file `default.config.yml` to `config.yml` and run with `node index.js`

## Requirements
- Node.js
- npm

## Settings
You should look up what business unit you want to book.

## Run weekly with cron.
- Edit your crontab (for example with `crontab -e`)
- Add the following line (used for booking on fridays):
```01 08 * * 5 node /path/to/script/index.js > /dev/null```
