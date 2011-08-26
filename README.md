Mongrue:
A simple, free-form REST interface to a MongoDB database instance.

> It is pitch black. You are likely to be eaten by a *mongrue*.

This is not the kind of service you would want to use in a production
environment. It has not security, no limits and virtually no structure.
That is the point.

Think of this project as a perfect server-mock that would allow you to
initially build your JavaScript client. With a little modification,
you can put some limits and a little security to it to allow your
JavaScript client to use this for server-side storage without needing
any HTML5 capabilities.

Get it Going
============

This project depends on a local [node.js][1] installation as well as a
[MongoDB][2] running on the localhost. So before you begin, get both
of those installed and running... then come back.

Don't worry. I'll wait.

Installation
------------

Alright, now that both of those guys are installed, you need to 
install [NPM][3], using the following
command:

    $ curl http://npmjs.org/install.sh | sh

What? You already have that installed? Smart kid. Here's a nickel.

Use the *NPM* to install the following dependency:

    $ npm install mongodb

Yes, you probably guessed that was the only dependency. Here's
another nickel.


Running the Server
------------------

Assuming you have [MongoDB][2] running on the local host, all you need
to do to get the server going, is:

    $ node index.js

But before you run it, you might want to edit the `config.js` file:

    $ vi config.js

This file contains the configuration values. Note the two most important
ones that I tacked on to the end of that file:

  * `clientKey`: If this is set (and I suggest you uncomment it), every
    client request must include a `x-mongrue-clientkey` HTTP header with
    a value that corresponds to that key. Just a wee bit of a safety check.

  * `collectionNames`: This contains a list of the acceptable *collections*
    (that is MongoDB parlance for the REST concept of *resources*). For
    instance, `http://localhost:8888/unicorns` will work if this contains a
    `unicorns` property that is set to `1`.

REMEMBER: This project is really a *template project*. It is intended that
you'll want to modify it... *significantly*. This is just a kick starter for
your own creation.

The code structure came from the [Node Beginner][4] website, so you may
want to read that article before diving into the source.


Project Tests
-------------

Since JavaScript has this interesting little feature called *cross-site domain calls*,
it makes it pretty difficult to run QUnit tests in a browser when they test the
results of our Mongrue project.

So, if you request [http://localhost:8888/test](http://localhost:8888/test), you
will start up the unit tests, which will call back to the server and perform 
the unit tests in the `test.js` file.


Using the Beast
===============

Like I said before, this is a simple REST interface to the MongoDB
database. The following are the only commands it accepts:

GET ALL
-------

Let's supposed you had a *collection* of `users` in your Mongo, you can retrieve them all by:

    GET http://localhost:8888/users

Told you it was simple. You can give it the standard Mongo range parameters, like:

    GET http://localhost:8888/users?limit=2
    GET http://localhost:8888/users?skip=10
    GET http://localhost:8888/users?sort=name

Why yes, you can combine them in meaningful ways:

    GET http://localhost:8888/users?limit=2&skip=10&sort=name

I would really like to be able to pass [advanced queries][5] with
a `query` parameter, like:

    GET http://localhost:8888/users?query={"username":"howard"}

Note to self: This *kinda* works, but I would really like to figure out how to
do the range of `$gt` and other Mongo operations.

GET ID
------

Once you have the `_id` of the entry, you can specify this on the GET
line to retrieve just that one entry, as in:

    GET http://localhost:8888/users/4e5550c3718adf0000000001

Which in my database, returns:

    {
      "username": "howard",
      "title": "Code Carpenter",
      "_id": "4e5550c3718adf0000000001"
    }

Note: If you have a *model id* with a parameter of `id`, you can use that instead of the Mongo `_id` value. For instance:

    GET http://localhost:8888/users/42

Which *could* return:

    {
      "id" : 42
      "username": "howard",
      "title": "Code Carpenter",
      "_id": "4e5550c3718adf0000000001"
    }

How does it tell which is which? Length, baby. If it is 12 bytes long, then its a foot, and therefore, we search the `_id` field, otherwise, we look for a `id` field. That's right, size matters.

POST
----

How do you get new entries in the database? Using `POST` of course. The *body* of the `POST` must be a JSON-formatted object, which will be shoved into the *collection* specified in the URL. For instance:

    POST http://localhost:8888/users

Where the *body* is:

    { "username":"bobdog", "title":"King Fool" } 

Will return what was put into the database:

    {
      "username": "bobdog",
      "title": "King Fool",
      "_id": "4e5578ce3e89ba0000000001"
    }

Obviously, that `_id` value may prove to be important, later.

PUT
---

Allows you to *replace* the contents of an existing entry. Let's
suppose we did the `POST` example above, and got the `_id` value
shown, we could:

    PUT http://localhost:8888/users/4e5578ce3e89ba0000000001

With a body:

    { "username":"bobdog", "title":"King for a Day" } 

Note: This returns the entry that was replaced, not the entry as it is *currently*.
Yeah, I suppose neither response is that helpful.

DELETE
------

Remove an entry using the `DELETE` method, as in:

    DELETE http://localhost:8888/users/4e5578ce3e89ba0000000001

Which simply returns the words `OK`.


What's Next
===========

I've warned you time and time again to wipe your nose, and modify this code before
doing anything else. This project really is a *template* for you to use to do something
with. Don't expect that you can just modify the `config.js` file and it will give you
what you need.

However, this brings me to the top tasks that I'd like to add to this project so that
it is more useful out of the box.

Tasks
-----

  * Add a `config.js` file that can be use to specify application properties. @done
  * Add a private `application id` string that needs to be passed in to verify
    the client. @done
  * Add an array somewhere of the *collections* that can be accessed. @done
  * Add a notion of a *user account* that may or may not correspond to a Mongo
    database.

I'm sure we'll make this list longer if we think about it.

  [1]: http://www.nodejs.org
  [2]: http://www.mongodb.org
  [3]: http://howtonode.org/introduction-to-npm
  [4]: http://www.nodebeginner.org
  [5]: http://www.mongodb.org/display/DOCS/Advanced+Queries