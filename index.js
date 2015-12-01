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

app.use(function(request, response, next){
    request.accountId = 1;
    next();
});

app.get('/AddressBooks/:id', function(req, res) {
    connection.query("SELECT * from AddressBook WHERE id=" + req.params.id, function(err, result) {
        if (err) {
            console.log('error!');
        }
        else if (result.accountId !== req.accountId) {
            res.status(404).send("You don't have access to that account");
        }
        else {
            console.log(result);
            res.send(result);
        }
    });
});

// app.get('/query', function(req, res) {
//     connection.query("SELECT * from Account", function(err, result) {
       
        
//     });
// });

var server = app.listen(process.env.PORT, process.env.IP, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});