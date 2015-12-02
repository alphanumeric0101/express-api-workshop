# ExpressJS API Workshop for DecodeMTL Full-Stack Bootcamp
*Your express way to the web development world!*

## Basic instructions
* You are **ENCOURAGED** to work in teams of two or three students on this workshop! Here, encouraged is a euphemism ;)
* Fork this repository and create a new Cloud9 project by cloning your fork
* For this workshop you can do all your work in the `master` branch :)
* After each part, **make sure to commit AND push your work**!
* You will need to import [`data.sql`](https://github.com/DecodeMTL/node-mysql-workshop/blob/master/data.sql) to your MySQL server to get some basic tables going
* Your work will mostly be done in an `index.js` file. If you feel up for it, you can separate your work in modules but this is not required right now.
* You should start by creating an empty ExpressJS app, make sure it can listen properly, and then make sure you can make a basic MySQL query. Once you have that, you will be in a better position to get started.

## Overview
*please take the time to read this carefully, and ask us questions if you do not understand what you are reading*

In this workshop, we will be creating our first tiny API. This API -- or interface -- will be the point of contact between our users and a database of address books (contact information).

We will present the user with a few URL patterns that they will use with different HTTP verbs (GET/POST/PUT/DELETE). Using the **uniform interface** that is the HTTP protocol, we will enable a variety of standard, compatible clients to connect to our API and use it to manage their contacts. The API will therefore be available to web browsers, iPhone/Android apps, and any other system that can connect to the internet and has web access.

Our API will be **stateless**: this means that every new request that comes in will be met with a response, independently of other requests. To give the illusion that our users are "signed in" to the application, we will be giving them a token when they login successfully, and they will have to give us back that token with every subsequent request they make. This is the **only way** we will be able to create an illusion of continuity.

Our API will be based on the **client-server model**: this will allow us to separate our concerns and concentrate on simply building a good interface. Someone else can take care of building a web app, iPhone/Android apps and any other wild ideas they can come up with, and all these ideas can evolve separately as long as our API is maintained.

Our API will be **resource-based**, and will be sending and receiving **representations** of these resources. Resources are already a familiar concept on the web, where every resource gets its own URL. For example, the website of DecodeMTL is at http://www.decodemtl.com/ and the about page is at http://www.decodemtl.com/about/. In our case, the resources that we are dealing with will not be web pages and images. Rather, they will be accounts and address books, entries and emails, ...

We will make these resources available using different URL patterns and HTTP verbs. One common way of doing that is making each resource available as /ResourceName and use HTTP verbs to describe what we want to do with the resource. Here is how part of our API could look during its development:

```
GET /Accounts --> retrieve all accounts in the DB (which the user is authorized to look at)
GET /Accounts/:id --> retrieve an account by its ID (if the user is authorized to look at it)
POST /Accounts --> create a new account using form data
PUT /Accounts/:id --> modify an account by its ID
DELETE /Accounts/:id --> delete an account by its ID
```

The `GET /Accounts` endpoint could further be improved by letting the user pass in **query string** parameters, such as `?sort=firstName&limit=10` to get back the results differently.

Whenever we are asked for a certain resource, it should be clear to consumers of our API that we are simply sending a **representation** of the resource, not the resource itself. For instance, in the case of an account, we have a MySQL Accounts table with some columns, but we will be sending a representation of an account as a JSON string. We could choose to send XML instead, or maybe even an HTML page with the account data. In our case we will be choosing JSON, which is lightweight, and intelligible to any modern programming language.

## Part 1: Getting Started!
In later stages, we will be adding signup/login to our app. Before doing that, we'd still like to get some basic things going, so we will be faking that our users are "signed in" to the system. To do this, create a new ExpressJS app, and add one middleware to it. The middleware will simply add the `accountId` property to the `request` object, set it to value `1`, and pass control to the next middleware using `next()`.

Any operation we do from here on will be using `request.accountId` to figure out who is the logged in user. Later on, we'll take care of filling that with the actual user ID.

## Part 2: Listing some addressbooks
Create a new endpoint `GET /AddressBooks`. When this endpoint is requested, it should respond with a list of address books for the currently logged in user, in JSON format. The listing should be an array of addressbook objects, like this:

```js
{
  id: 3,
  name: 'business contacts'
}
```

## Part 3: Listing a specific addressbook
Create a new endpoint `GET /AddressBooks/:id`. When it is requested, it will respond with a single addressbook by its ID. If the requested addressbook does not exist, or if it belongs to an account other than the logged in account, you should return a `404 Not Found` response to the user.

## Part 4: Creating a new addressbook
Create a new endpoint `POST /AddressBooks`. When it is requested, it will look at the `request.body` and find out if it has a `name` property. Then, if the user is logged in (i.e. if `request.accountId` is defined), create a new address book with that name, and assign it to the currently logged in account. As a response, send a **representation** of the addressbook as a JSON object with the `id` and `name`. If the user is not logged in, this endpoint should return a `404 Not Found` instead.

## Part 5: Deleting an addressbook
Create a new endpoint `DELETE /AddressBooks/:id`. When it is requested, it will delete the addressbook by its ID, only if it belongs to the logged in user. Otherwise it will return a `404 Not Found` message.

## Part 6: Modifying an addressbook
Create a new endpoint `PUT /AddressBooks/:id`. When it is requested, it will look at the `request.body` and modify the addressbook based on the passed in form data, only if the addressbook belongs to the currently logged in user. Then it will return a JSON string corresponding to the new representation of the object. Otherwise it will return a `404 Not Found` message.

## Look back on what we did
After having completed all these endpoints, we are now exposing functionality that enables us to manage AddressBook resources: we can create them, list them, update them and delete them. This is commonly referred to as CRUD -- short for **C**reate, **R**ead, **U**pdate, **D**elete -- and forms the basis of our API. We could eventually add new functionalty on top of that to do more complex things, but just being able to do basic CRUD can get us pretty far!

## Part 7: copy/pasta!
In this part, we are going to create a similar set of endpoints that we did for `/AddressBooks`, but for `/Entries` instead. Create the same endpoints for adding new entries, simply focusing on the `firstName`, `lastName` and `birthday` properties. You will also need the `addressbookId` to be passed to you in the form data. **Make sure to check whether the passed in addressbook belongs to the currently logged in user!**

## Part 8: more copy/pasta!
Here, we are going to create the same CRUD endpoints for addresses/emails/phones. As always, we want to make sure that we are only adding these objects if the user is authorized to do it. Otherwise, we might as well give them access to our database :)

## Part 9: adding user signup!
In this part we will be adding user signup to our application, allowing users to create real accounts and take ownership of their address books.

To do so, we will be exposing a `POST /Accounts/signup` endpoint that will receive `email` and `password`, and create a new account in our MySQL database. If the account creation is successful, we will return a representation of the newly created account to the user as a JSON string, with `id` and `email` properties.

*Before adding the account to our database*, we will take care of **hashing the user's password**. Hashing is a mechanism by which we can "encode" a string in a way that is not recoverable. Many algorithms exist to create such hashes out of string (passwords for us), and choosing the best one is not an easy task. This is why we will be using a library to do the encoding of passwords. A great one for NodeJS is called [`bcrypt-nodejs`](https://www.npmjs.com/package/bcrypt-nodejs). For our purposes, we will be using the `bcrypt.hashSync` function mentioned in the README. Since this hashing process can be quite intensive on the CPU, there is an asynchronous version that can be used for performance.

Finally we want to make sure **email addresses are unique**. If we try to add two Accounts with the same `email` our database does not care at the moment. We *could* fix this by checking if the provided email exists (`SELECT * FROM Accounts WHERE email=...`), but there is a much more robust way. We can take advantage of MySQL's unique indexes to enforce unique emails. In general, we would have created our Accounts table with the unique constraint, but since we already have the table, we will be altering it with the following query:

```sql
ALTER TABLE Accounts ADD UNIQUE KEY unique_emails(email);
```

Depending on the status of our data, running this could either work fine, or throw the following error at us:

```
ERROR 1062 (23000): Duplicate entry 'test@test.com' for key 'unique_email'
```

If we get this, then our unique index was not added to the table. We would manually clean up the table and re-run the query. **In a real production app, this would be handled a bit differently to ensure we don't lose customer data**.

This "ERROR 1062" is exactly what we will be getting if we try to `INSERT` a new account with an already existing email. We should be checking for that in our code, and tell the user that they should use a different email. Some people choose to send a `409 Conflict` error status, but others choose the `400 Bad Request`.

Once all that is done, make sure to test this endpoint for all possible cases.

## Part 10: Adding user login
User signup and login is a complex subject filled with traps. Everything we built so far has been using this `accountId` from the `request` object, trusting that it will correspond to the actual owner of that data. To enforce this, many things have to be done in a real production-ready application:

  * Securely hashing passwords to ensure some level of security
  * Making sure our application is running over HTTPS
  * Limiting the number of times a user can try to login, using [CAPTCHAs](https://www.google.com/recaptcha/intro/index.html)
  * Letting users sign in with facebook/twitter/linkedin/whatever-other-provider
  * Allowing the user to reset their password if they forgot it
  * And the list goes on and on...

For these reasons, many projects are built upon existing user management functionalities. [Stormpath](https://stormpath.com/) is one example of a web service that provides all sorts of user management features. [PassportJS](http://passportjs.org/) is a NodeJS library that can ease the creation of user functionalities directly in your own API.

In our case, we will be implementing a basic `POST /Accounts/login` endpoint. It will accept an email and a password, and will manually check if the information is correct. To do so, we will need to encode the password using the same `bcrypt` library we used to store the user's password.

If we find a matching account in the database, we will be giving a token to the user that they can use to identify further HTTP requests. We will have to store this token along with the account ID. This will provide us with a secure way to let users identify themselves: they'll just have to add `?token=XXXXX` to every call they make to our API. This way, we can preserve the **statelessness** of our server.

To do this, we'll need a few steps:

  1. Create a new table called `Tokens` in MySQL. It will have two columns, `token` and `accountId`. This table does not need an automatically incrementing unique ID. We will be adding rows to this table to link tokens to accounts.
  2. When a user successfully logs in to the system by doing a `POST /Accounts/login`, we will generate a random token. A good way to do this is to use `bcrypt`'s `genSaltSync` function.
  3. We will add that token to our `Tokens` table, and return it to the user as a JSON result like `{"token": "xyzjfkejk"}`.
  4. After that, it will be up to the user to identify themselves by passing this token to us in the query string.
  5. As a last step, we will create an Express middleware. It will be checking `request.query.token`, and making a MySQL query to find out if there is a token that matches. If it does, we will set `request.accountId` to be that account. Otherwise we will **make sure that `request.accountId` is set to an empty value**, either by manually setting it to `null` or by doing `delete request.accountId`. Even though this seems overboard, it's a simple way to be safer.

Following this, you should test your login/signup system thoroughly.

## Part 11: filtering, sorting, pagination and relationships
With our newly-acquired knowledge of using the [Sequelize ORM](https://github.com/sequelize/sequelize), we will have a much easier time adding filtering, sorting, pagination and relationships to make our API more pleasing to use. Here is a brief overview of each of these features:

### Pagination
When retrieving a list of entities the list can be quite long. Sometimes we only want to see a "page" of results, and either let the user click for further pages like on Google's search results, or let the user infinitely scroll to get more results like on Facebook's feed.

Both operations are accomplished by adding `limit` and `offset` parameters to our queries. For example, doing a `GET` request to `/AddessBooks?limit=5` should return only the first 5 address books, and `/AddressBooks?limit=5&offset=5` should return the next 5 until there are no more results.

### Sorting
When retrieving a list of entities we may require that the list be in a particular order. For example, some users will choose to have their address books sorted by first name, others by last name.

We should be able to provide these results to our users by having them add a `sort` parameter to the query string. We will also need to know the `sort_direction`, but we can assume it to be ascending by default.

For example, a `GET` request to `/Entries?sort=firstName` will return the entries in alphabetical order of first name. Sending a `GET` to `/Entries?sort=lastName&sort_direction=desc` will return the entries in reverse alphabetical order of last name.

### Filtering
When retrieving a list of entities, the user might optionally be trying to filter it. We can provide some basic filtering on strings and numbers. One way of doing this is to let the user pass a JSON-encoded `filter` parameter in the query, something like this: `GET /Entries?filter={"firstName": "ziad"}`.

### Relationships
When retrieving a list of entities, the user might optionally want to include related entities. For example, when doing a request to `/Entries/123`, the user might want to get all addresses/emails/phones related to Entry ID 123.

One way of doing this would be to let the user pass an `include` query parameter, with a comma-separated list of relationships. For example, requesting `/Entries/123?include=emails,phones` could return something like this:

```js
{
  "id": 123,
  "firstName": "John",
  "lastName": "Smith",
  "emails": [
    {
      "id": 42,
      "email": "john@smith.com",
      "type": "home"
    },
    // ...
  ],
  "phones": [
    {
      "id": 38,
      "type": "work",
      "phoneNumber": "514-555-1212"
    },
    // ...
  ]
}
```

### Implementing it!
Using the Sequelize ORM, most of these features are quite straightforward to implement. For example, instead of doing a call to `Entry.findAll()`, one would do `Entry.findAll({limit: 10})` or `Entry.findAll({limit: req.query.limit})`.

Using the [Sequelize documentation](http://docs.sequelizejs.com/en/latest/), implement one of these features at a time. This is definitely work that can be split up between the different members of your team :)
