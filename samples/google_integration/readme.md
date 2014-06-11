# Example of Stormpath Social Login support for Facebook

Copyright &copy; 2014 Stormpath, Inc. and contributors.

This project is open-source via the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0).

For additional information, please see the [Stormpath Node.js API Documentation](http://docs.stormpath.com/nodejs/api).

## Pre Requirements

To run this example app you should have properly configured
 Google project.

1. Go to `Google developer console` and create project
2. Go to `APIs & auth` -> `Credentials` in newly created project
3. Press `Create new client ID`
4. Set `Authorized redirect URI` to `http://localhost:4444/oauth2callback` (required for this example)
5. Remember `Client ID` and `Client Secret`
6. Set environment variables:
```bash
GOOGLE_CLIENT_ID=$ClientID$
GOOGLE_CLIENT_SECRET=$clientSecret$
GOOGLE_REDIRECT_URI="http://localhost:4444/oauth2callback"
```

## Install dependencies

```bash
npm install
```

## Run

```bash
node example.js
```