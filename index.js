var express = require('express');
var bodyParser = require('body-parser');

var db = require('mysql');
var connection = db.createConnection({
    host: process.env.IP,
    user: process.env.C9_USER,
    password: '',
    database: 'addressbook'
});

var app = express();
app.use(bodyParser.json());

app.use(function(request, response, next) {
    request.accountId = 1;
    next();
});

///////////////////////////////////////////////////
////////////////DISPLAY ENTRY//////////////////////
/////////                               ///////////

app.get('/AddressBooks/:id', function(req, res) {
    connection.query("SELECT * from AddressBook WHERE id=" + req.params.id, function(err, result) {
        result.forEach(function(ab) {
            if (err) {
                console.log('error!');
            }
            else if (ab.accountId !== req.accountId) {
                res.status(404).send("You don't have access to that account");
            }
            else {
                console.log(result);
                res.send(result);
            }
        });
    });
});

///////////////////////////////////////////////////
////////////////// ADD ENTRY///////////////////////
/////////                               ///////////

app.post('/AddressBooks', function(req, res) {
    if (req.body.name && req.accountId) {
        connection.query("INSERT INTO AddressBook SET name='" + req.body.name + "', accountId=" + req.accountId, function(err, result) {
            if (err) {
                console.log("That's an error");
            }
            else {
                connection.query("SELECT * FROM AddressBook WHERE id=" + result.insertId, function(err, displayResult) {
                    if (err) {
                        console.log("Error at the 2nd select level");
                    }
                    else {
                        res.send(displayResult);
                    }
                });
            }
        });
    }
    else {
        res.status(404).send('You have no books, please create an account');
    }
});

///////////////////////////////////////////////////
////////////////DELETE ENTRY///////////////////////
/////////                               ///////////

app.delete('/AddressBooks/:id', function(req, res) {
    connection.query("DELETE from AddressBook WHERE AddressBook.id=" + req.params.id, function(err, result) {
        if (err) {
            console.log('bad query');
        }
        else if (result.accountId === req.accountID) {
            res.send('AddressBook with id ' + req.params.id + ' has been deleted');
        }
        else {
            res.status(403).send("You are not authorized to delete books on that account");
        }
    });
});

var server = app.listen(process.env.PORT, process.env.IP, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});