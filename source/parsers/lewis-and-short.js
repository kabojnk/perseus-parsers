// Node libraries
var fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser({attrkey: '@', explicitArray: false, mergeAttrs: true});
// var MongoClient = require('mongodb').MongoClient;


exports.title = 'Lewis + Short Dictionary';
exports.dbCollection = 'lewis_and_short';
exports.parse = function(next) {
	var xml = fs.readFileSync('../perseus_source_data/Classics/Lewis/opensource/lewis_sanitized.xml', 'utf8');
	parser.parseString(xml, function(err, result){		
		if (err) error(error, next)

		// The meat of the dictionary entries start a little bit in...
		return next(null, result['TEI.2'].text.body['div0']);
	});
};