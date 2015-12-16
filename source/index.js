var MongoClient = require('mongodb').MongoClient;

var config = require('./config.json');

// We have to use a (very ad hoc) state machine given the async nature of xml2js.
// For numerous reasons, I don't want to go parsing tons of things in parallel.
var currentState = 0;
var texts = [
    require('./texts/lewis-and-short')
];

if (!config) {
    throw new Error("Unable to load config.json");
}

// Setup the mongodb URI for connecting...
var mongoUri = 'mongodb://';
if (config.db.username && config.db.username.length) {
    mongoUri += config.db.username + '@' + config.db.password;
}
mongoUri += config.db.host + ':' + config.db.port + '/' + config.db.database;

processNext();

/**
 * Move to the next "text" in the array of texts, and process it.
 */
function next() {
    currentState++;
    if (currentState < texts.length) {
        process();
    } else {
        console.log("Done parsing and storing " + texts.length + " texts.");
        process.exit();
    }
}

function processNext() {
    if (currentState >= texts.length) return;

    text = texts[currentState];
    console.log("Parsing XML for: " + text.title);
    text.parse(function(err, data) {
        if (err) throw err;
        storeToDb(text.dbCollectionName, data, text.bookInfo);
    });
}

function storeToDb(collectionName, textData, bookInfo) {

    console.log("Storing collection to [" + collectionName + "]...");

    connectToDb(function(db) {

        // This data is small, and can run async
        storeCollectionMetaInfoToDb(db, bookInfo);

        var dbTextCollection = db.collection(collectionName);
        dbTextCollection.drop();
        dbTextCollection.insertMany(textData, function(err, docs) {
            if (err) throw err;
            console.log("Done!");
            next();
            db.close();
        });
    });
}

function storeCollectionMetaInfoToDb(db, bookInfo) {

    console.log("Storing text metadata to [" + config.db.collections.meta + "]...");

    var filter = { isbn: bookInfo.isbn };
    var options = { upsert: true, w: 1 };

    var dbMetaCollection = db.collection(config.db.collections.meta);
    dbMetaCollection.updateOne(filter, bookInfo, options, function(err, result) {
        if (err) throw err;
        console.log("Done storing metadata.");
    });
}

function connectToDb(whenDone) {
    MongoClient.connect(mongoUri, function(err, db) {
        if (err) throw err;
        whenDone(db);
    });
}
