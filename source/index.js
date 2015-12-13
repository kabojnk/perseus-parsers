var MongoClient = require('mongodb').MongoClient;

var config = require('./config.json');

// We have to use a (very ad hoc) state machine given the async nature of xml2js.
// For numerous reasons, I don't want to go parsing tons of things in parallel.
var currentState = 0;
var parsers = [
	require('./parsers/lewis-and-short')
];

if (!config) {
	throw new Error("Unable to load config.json");
	return;
}

// Setup the mongodb URI for connecting...
var mongoUri = 'mongodb://';
if (config.db.username && config.db.username.length) {
	mongoUri += config.db.username + '@' + config.db.password;
}
mongoUri += config.db.host+':'+config.db.port+'/'+config.db.database;

processNext();

function next() {
	currentState++;
	if (currentState < parsers.length) {
		process();
	} else {
		return;
	}
};

function processNext() {
	if (currentState >= parsers.length) return;

	parser = parsers[currentState];
	console.log("Parsing XML for: " + parser.title)
	parser.parse(function(err, data) {
		if (err) throw err;
		//console.dir(data, { depth: 10 });
		storeToDb(parser.dbCollection, data);
		next();
	});
}

function storeToDb(collectionName, data) {

	console.log("Storing to DB...");

	MongoClient.connect(mongoUri, function(err, db) {
    if(err) throw err;

    data.forEach(function(element, index, array) {
    	var collection = db.collection(collectionName);
    	db.collection.drop();
    	collection.insert(element, function(err, docs){
    		if (err) throw err;

    		if (index.length == array.length - 1) {
    			console.log("Done!");
    		}
    	});
    });
  });
}

console.log("Done parsing and storing into database.");
