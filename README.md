# hydra-bot-stopper

HYDRA Bot Stopper middleware with sqlite3-based URL blocking.

## Installation

A simple `npm install` is all it takes to install `hydra-bot-stopper` into your project and get it ready for use.

```
npm install hydra-bot-stopper
```

## Getting Started

```
const HydraBotStopper = require('hydra-bot-stopper');

HydraBotStopper
.initialize()
.then(( ) => {
  app.use(botstopper.urlblocker({
    auditRequest: (req) => {
      console.log('malicious request detected', { url: req.url, ip: req.ip });
    }
  }));
});
```

## How It Works

The botstopper has a local database of known bad URLs commonly requested by script kiddies and other malicious actors attempting to gain unauthorized access to your system. You install the botstopper middleware into your request processing chain as early as possible. This lets botstopper see the request URL as early as possible during request processing. If the URL is a known bad URL, botstopper will call your `auditRequest` callback and then respond accordingly.

A standard HYDRA app installs the /healthmon middleware, then botstopper, then the rest of the application. It is recommended to install botstopper before your session startup code so you won't even hit your database if it's a known-bad URL other than whatever you do in `auditRequest`.

## HydraBotStopper.initialize

The botstopper `initialize` function returns a Promise that resolves once all initialization work is completed.

During `initialize`, the module creates an in-memory sqlite3 database of known-bad URLs to be queried with each incoming request.

## HydraBotStopper.botstopper (options : Object) : middleware_function

The `botstopper` function accepts an `options` object and returns an ExpressJS middleware function that can be added to your application's processing chain using `app.use`.

### options.auditRequest : function

If specified, this function will be called with each known-malicious request received. This gives the developer the opportunity to process the information and perhaps take additional action such as auto-banning the IP address or authenticated user.

The function must return a Promise that resolves once auditing work is completed. If an object is resolved, it will be sent in JSON format to the client.

## Auditing Requests

The botstopper alone is enough to block common requests, but it's only step one. Commonly, you will also want some request auditing functionality to report on these requests when they are detected. To facilitate this (and not knowing your environment) botstopper will call a callback you register in the options as `auditRequest`.