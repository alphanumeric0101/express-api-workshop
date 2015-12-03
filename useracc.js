var express = require('express');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs')

var app = express();
app.use(bodyParser.json());

var Sequelize = require('sequelize');
var conn = new Sequelize('addressbook', 'alphanumeric0101'); //database, username, password
// Tell Sequelize about our Account entity
var Account = conn.define('Account', {
    email: Sequelize.STRING,
    password: Sequelize.STRING
}, {
    tableName: 'Account' // By default, Sequelize will assume our table name is the plural form
});

var Tokens = conn.define('Tokens', {
    token: Sequelize.STRING,
    accountId: Sequelize.STRING
}, {
    tableName: 'Tokens'
});

Account.hasOne(Tokens, {
    foreignKey: 'accountId'
});

var AddressBook = conn.define('AddressBook', {
    name: Sequelize.STRING
}, {
    tableName: 'AddressBook'
});

Account.hasMany(AddressBook, {
    foreignKey: 'accountId'
}); // Telling Sequelize about the one-to-many relationship

var Entry = conn.define('Entry', {
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    birthday: Sequelize.DATE
}, {
    tableName: 'Entry'
});

AddressBook.hasMany(Entry, {
    foreignKey: 'addressbookId'
});

var Phone = conn.define('Phone', {
    type: Sequelize.STRING,
    subtype: Sequelize.STRING,
    phoneNumber: Sequelize.STRING
}, {
    tableName: 'Phone'
});

// INCLUDED IN INDEX FILE

Entry.hasMany(Phone, {
    foreignKey: 'entryId'
});

Entry.belongsTo(AddressBook, {
    foreignKey: 'addressbookId'
});

Phone.belongsTo(Entry, {
    foreignKey: 'entryId'
});

// END INCLUDED FROM INDEX

//////////////////////////////////////
// BEGIN USER SIGN UP SIGN IN ////////
//////////////////////////////////////

// SIGN UP

app.post('/accounts/signup', function(req, res) {
    var hashedpw;
    bcrypt.hash(req.body.password, null, null, function(err, hash) {
        if (err) {
            console.log('something went wrong hashing that password');
        }
        else {
            hashedpw = hash;
            Account.create({
                email: req.body.email,
                password: hashedpw,
            }).then(function(result) {
                res.json('New Account created: ' + result.id + ' ' + result.email);
            }).catch(function(err) {
                console.log(err);
                res.status(404).send('Do you already have an account?');
            });
        }
    });
});

// SIGN IN

app.post('/accounts/login', function(req, res) {
    Account.find({
        where: {
            email: req.body.email
        }
    }).then(function(result) {
        bcrypt.compare(req.body.password, result.password, function(err, hashcomp) {
            if (err) {
                console.log('compare function failure...');
            }
            else if (hashcomp) {
                Tokens.create({
                    token: bcrypt.genSaltSync(),
                    accountId: result.id
                }).then(function(ress) {
                    res.send('Welcome back! \nYour token is: ' + ress.token);
                }).catch(function(err) {
                    console.log(err);
                });
            }
            else {
                res.status(401).send('Password or email incorrect');
            }
        });
    });
});

// TOKEN ASSIGNMENT

app.use(function(req, res, next) {
    var toke = (req.query.token ? req.query.token : req.body.token);
    console.log(toke);
    Tokens.findOne({
        where: {
            token: toke
        }
    }).then(function(result) {
        console.log(result);
        if (result) {
            req.accountId = result.accountId;
            next();
        }
        else {
            req.accountId = null;
            next();
        }
    });
});

//INCLUDED IN INDEX FILE : ALL FUNCTIONS THAT FOLLOW

/////////////////////
//DISPLAY FUNCTION/S/
/////////////////////

// Display AddressBook by ID
var direction = 'ASC';

app.get('/AddressBook/:id', function(req, res) {

    if (req.query.sort_direction) {
        direction = req.query.direction;
    }

    AddressBook.findAll({
        where: {
            id: req.params.id
        },
        limit: req.query.limit,
        offset: req.query.offset,
        order: [req.query.sort, direction]
    }).then(function(result) {
        if (result.accountId === req.accountId) {
            res.send(result);
        }
        else {
            res.status(404).send('Sorry');
        }
    });
});

// Display Entry by Entry ID

app.get('/Entry/:id', function(req, res) {

    if (req.query.sort_direction) {
        direction = req.query.direction;
    }

    AddressBook.find({
        include: [{
            model: Entry,
            // where: {
            //     id: req.params.id,
            // },
            where: req.query.filter,
            where: {
                id: req.params.id
            },
            limit: req.query.limit,
            offset: req.query.offset,
            order: [req.query.sort, direction],
            include: [{
                model: req.query.include,
                where: {
                    entryId: req.params.id
                }
            }]
        }],
        where: {
            accountId: req.accountId
        },
    }).then(function(result) {
        console.log(result);
        res.send(result.Entries);
    }).catch(function(error) {
        console.log(error);
    });

});

//Display Entry_Phone

app.get('/Phone/:id', function(req, res) {

    if (req.query.sort_direction) {
        direction = req.query.direction;
    }

    Phone.find({
        include: [{
            model: Entry,
            include: [{
                model: AddressBook,
                where: {
                    accountId: req.accountId
                },
                limit: req.query.limit,
                offset: req.query.offset,
                order: [req.query.sort, direction]
            }]
        }],
        where: {
            id: req.params.id
        },
    }).then(function(result) {
        console.log(result);
        res.json(result);
    }).catch(function(error) {
        console.log(error);
    });
});

/////////////////////
//Creating FUNCTIONS/
/////////////////////

// Create AddressBook by ID

app.post('/AddressBook', function(req, res) {
    console.log(req.accountId);
    Account.find({
        where: {
            id: req.accountId
        }
    }).then(function(result) {
        console.log(result)
        if (!result) {
            res.status(404).send('There is no account like that...');
        }
        else {
            AddressBook.create({
                name: req.body.name,
                accountId: result.id
            }).then(function(result) {
                res.send(result.name + ' book was created');
            });
        }
    });
});

// Create Entry

app.post('/Entry', function(req, res) {
    Account.find({
        include: [{
            model: AddressBook,
            where: {
                id: req.body.addressbookId
            }
        }],
        where: {
            id: req.accountId
        }
    }).then(function(result) {
        if (!result) {
            res.status(404).send('You are not authorized to add an Entry there');
        }
        else {
            Entry.create({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                birthday: req.body.birthday,
                addressbookId: req.body.addressbookId
            }).then(function(newEntry) {
                res.send('New entry was created with first name: ' + newEntry.firstName);
            });
        }
    });
});

//Create Phone_Entry

app.post('/Phone', function(req, res) {
    AddressBook.find({
        include: [{
            model: Entry,
            where: {
                id: req.body.entryId
            }
        }],
        where: {
            accountId: req.accountId
        },
    }).then(function(result) {
        if (!result) {
            res.status(404).send('You are not authorized to add a Phone there');
        }
        else {
            Phone.create({
                type: req.body.type,
                subtype: req.body.subtype,
                phoneNumber: req.body.phoneNumber,
                entryId: req.body.entryId
            }).then(function(result) {
                res.json(result);
            });
        }
    });
});

/////////////////////
//Deleting FUNCTIONS/
/////////////////////

// Delete AddressBook by ID

app.delete('/AddressBook/:id', function(req, res) {

    AddressBook.findById(req.params.id).then(function(result) {
        if (result.accountId === req.accountId) {
            AddressBook.destroy({
                where: {
                    id: req.params.id
                }
            });
        }
        else {
            res.send('Did not delete. Are you authorized?');
        }
    }).then(function() {
        res.send('AddressBook with id: ' + req.id + ' was deleted.');
    });
});

// Delete Entry by Entry ID

app.delete('/Entry/:id', function(req, res) {
    AddressBook.find({
        include: [{
            model: Entry,
            where: {
                id: req.params.id
            }
        }],
        where: {
            accountId: req.accountId
        },
    }).then(function(result) {
        if (req.accountId === result.accountId) {
            res.send('Deletion Completion');
            return Entry.destroy({
                where: {
                    id: req.params.id
                }
            });
        }
        else {
            res.send('Did not delete. Are you authorized?');
        }
    });
});
//Delete Entry_Phone

app.delete('/Phone/:id', function(req, res) {
    AddressBook.find({
        include: [{
            model: Entry,
            include: [{
                model: Phone,
                where: {
                    id: req.params.id
                }
            }]
        }],
        where: {
            accountId: req.accountId
        },
    }).then(function(result) {
        if (req.accountId === result.accountId) {
            res.send('Deletion Completion');
            return Phone.destroy({
                where: {
                    id: req.params.id
                }
            });
        }
        else {
            res.send('Did not delete. Are you authorized?');
        }
    });
});

/////////////////////////////
//////Modify Functions///////
/////////////////////////////

//Modify AddressBook by Id

app.put('/AddressBook/:id', function(req, res) {
    AddressBook.findById(req.params.id).then(function(result) {
        if (result.accountId === req.accountId) {
            result.update({
                name: req.body.name
            });
            res.send('Name changed to ' + result.name);
        }
        else {
            res.status(404).send('Are you authorized on that account?');
        }
    });
});

// Modify Entry by ID

app.put('/Entry/:id', function(req, res) {
    AddressBook.find({
        where: {
            accountId: req.accountId
        },
        include: [{
            model: Entry,
            where: {
                id: req.params.id
            }
        }]
    }).then(function(result) {
        if (result) {
            res.json(result);
            result.Entries[0].update({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                birthday: req.body.birthday
            });
            res.send('You udpated the entry!');
        }
        else {
            res.status(404).send('Are you authorized on that account?');
        }
    });
});

// Modify Phone by ID

app.put('/Phone/:id', function(req, res) {
    AddressBook.find({
        where: {
            accountId: req.accountId
        },
        include: [{
            model: Entry,
            include: [{
                model: Phone,
                where: {
                    id: req.params.id
                }
            }]
        }]
    }).then(function(result) {
        if (result) {
            result.Entries[0].Phones[0].update({
                type: req.body.type,
                subtype: req.body.subtype,
                phoneNumer: req.body.phoneNumber
            });

            res.send('You updated a Phone entry');
        }
        else {
            res.status(404).send('Are you authorized on that account?');
        }

    });
});

// END INLUDED IN INDEX FILE

/////////////////////
//SERVER INIT////////
/////////////////////
var server = app.listen(process.env.PORT, process.env.IP, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});