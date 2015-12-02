var Sequelize = require('sequelize');

var conn = new Sequelize('addressbook', 'ziad_saab'); //database, username, password

// Tell Sequelize about our Account entity
var Account = conn.define('Account', {
    email: Sequelize.STRING,
    password: Sequelize.STRING
}, {
    tableName: 'Account' // By default, Sequelize will assume our table name is the plural form
});

var AddressBook = conn.define('AddressBook', {
    name: Sequelize.STRING
}, {
    tableName: 'AddressBook'
});

Account.hasMany(AddressBook, {foreignKey: 'accountId'}); // Telling Sequelize about the one-to-many relationship

var Entry = conn.define('Entry', {
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    birthday: Sequelize.DATE
}, {
    tableName: 'Entry'
});

AddressBook.hasMany(Entry, {foreignKey: 'addressbookId'});

Account.findById(1).then(function(result) {
    console.log('i found the account. the email is: ' + result.email)
})

AddressBook.findById(1).then(function(result) {
    console.log(result);
})

Account.find({
    where: {
        email: 'test@test.com'
    },
    limit: 5,
    offset: 5
}).then(function(result) {
    console.log(result);
});

Account.find({
    include: [
        {
            model: AddressBook,
            include: [Entry]
        }
    ],
    where: {
        id: 1
    },
    exclude: ['password']
}).then(function(result) {
    console.log(JSON.stringify(result, "\t"));
}).catch(function(err) {
    console.log(err);
});

Account.findById(1).then(function(account) {
    return AddressBook.create({
        name: 'hello from sequelize :)'
    });
}).then(function(book) {
  account.addAddressBook(book);
}).catch(function(err) {
  console.log(err);
});
