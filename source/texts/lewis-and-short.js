/**
 * Parsing information for the L+S "A Latin Dictionary". Structure is flattened to remove the letter-by-letter element
 * grouping of terms.
 */
var fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser({attrkey: '@', explicitArray: false, mergeAttrs: true});

exports.title = 'Lewis + Short Dictionary';
exports.dbCollectionName = 'lewis_and_short';

var bookInfo = {};

// 
var transformBodyData = function(data) {

    // The meat of each letter starts out at text > body > div0
    data = data['TEI.2'].text.body['div0'];

    var flattened_entries = [];

    // For each letter
    data.forEach(function(element, index, array) {

        console.log("Transforming data for entries under: " + element.n);

        // if we have a superEntry, grab that
        if (element.hasOwnProperty("superEntry")) {
            console.log("Transforming " + element.superEntry.length + " super entries...");
            element.superEntry.forEach(function(el, i, a) {
                if (el.hasOwnProperty("entry")) {
                    flattened_entries = flattened_entries.concat(el.entry);
                }
            });
        }
        // Add all other entries
        if (element.hasOwnProperty("entry")) {
            console.log("Transforming " + element.entry.length + " normal entries...");
            flattened_entries = flattened_entries.concat(element.entry);
        }
    });

    console.log("Transformation done");

    return flattened_entries;
};

var getBookInfo = function(data) {

    var header = data['TEI.2']['teiHeader'];
    var titleStatement = header.fileDesc.titleStmt;
    var bookStructure = header.fileDesc.sourceDesc.biblStruct;

    exports.bookInfo = {
        status: header.status,
        title: bookStructure.monogr.title,
        author: titleStatement.author,
        funding: titleStatement.funder,
        publish_location: bookStructure.monogr.imprint.pubPlace,
        publisher: bookStructure.monogr.imprint.publisher,
        publish_date: bookStructure.monogr.imprint.date,
        isbn: bookStructure.idno._
    };
};

exports.parse = function(next) {
    var xml = fs.readFileSync('../perseus_source_data/Classics/Lewis/opensource/lewis_sanitized.xml', 'utf8');
    parser.parseString(xml, function(err, result) {
        if (err) error(error, next);

        bookInfo = getBookInfo(result);
        result = transformBodyData(result);

        // The meat of the dictionary entries start a little bit in...
        return next(null, result);
    });
};

exports.bookInfo = bookInfo;