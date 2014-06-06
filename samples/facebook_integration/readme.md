# Example of Stormpath Social Login support for Facebook

Copyright &copy; 2014 Stormpath, Inc. and contributors.

This project is open-source via the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0).

For additional information, please see the [Stormpath Node.js API Documentation](http://docs.stormpath.com/nodejs/api).

## Pre Requirements

To run this example app you should have properly configured
 Facebook application.

1. Go to `Facebook developer console` and create application
2. Go to `Settings` in newly created application
3. Press `Add Platform` and choose `Web site` in popup
4. Set `Site URL` to `http://localhost:4444/` (required for this example)
5. Go to `Dashboard` and remember `App ID` and `App Secret`
6. Set environment variables:
```bash
FACEBOOK_CLIENT_ID=$AppID$
FACEBOOK_CLIENT_SECRET=$AppSecret$
FACEBOOK_REDIRECT_URI="http://localhost:4444/"
```

## Install dependencies

```bash
npm install
```

## Run

```bash
node example.js
```