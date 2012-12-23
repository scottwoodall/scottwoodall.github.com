---
layout: post
title: Configure Express (Node.js) to Connect to RedisToGo on Heroku for Sessions
---

Developing an application using the [Express](http://expressjs.com/) framework
built on top of [node.js](http://nodejs.org) and deploying it to
[Heroku](http://heroku.com) has been a great experience. Not having to worry
about the sysadmin details and focusing only on developing the application is
refreshing.

I needed a way to store my user sessions and Express gives us the ability to
hook into Redis via [connect-redis](https://github.com/visionmedia/connect-
redis).

Heroku offers several addons and one of them is
[RedisToGo](http://redistogo.com/). RedisToGo offers a free plan (5MB RAM, 1
database) which is great for development. You can add this free plan to your
Heroku application by issuing:

    
    
    heroku addons:add redistogo:nano
    

  
Now run `heroku config` and you'll notice a `REDISTOGO_URL` entry. A little
massaging needs to take place to get the necessary information passed to
`connect-redis`.

We'll use the `url` module to parse our environment variable
(`process.env.REDISTOGO_URL`) and pass the correct information to the
`connect-redis` constructor. We have to perform a `split` on `redisUrl`
because `url` doesn't give us all the required information.

    
    
    var express = require('express'),
        url = require('url'),
        RedisStore = require('connect-redis')(express);  
    app.configure('production', function () {
        var redisUrl = url.parse(process.env.REDISTOGO_URL),
            redisAuth = redisUrl.auth.split(':');  
        app.set('redisHost', redisUrl.hostname);
        app.set('redisPort', redisUrl.port);
        app.set('redisDb', redisAuth[0]);
        app.set('redisPass', redisAuth[1]);
    });  
    app.configure(function () {
        app.use(express.session({
            secret: 'super duper secret',
            store: new RedisStore({
                host: app.set('redisHost'),
                port: app.set('redisPort'),
                db: app.set('redisDb'),
                pass: app.set('redisPass')
            })
        }));
    });
    

  
Now you're off and running with Redis keeping track of all your Express
sessions!

