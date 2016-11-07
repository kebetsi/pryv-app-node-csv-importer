var readline = require('readline'),
    fs = require('fs');

module.exports = csvReader;

// file, delimiter, numItems, onLine, onClose, onError
function csvReader(params) {
  var fd = fs.createReadStream(params.file);

  var lineReader = readline.createInterface({
    input: fd
  });

  params.delimiter = params.delimiter || ',';

  params.onClose = params.onClose || function () {
      console.log('closing input stream');
    };

  params.onLine = params.onLine || function (line) {
      sLine = line.split(delimiter);
      if (sLine.length !== numItems) {
        console.error('parsed line has wrong number of items');
        lineReader.close();
      }
      console.log(sLine);
    };

  params.onError = params.onError || function (errorMessage) {
      console.error(errorMessage);
    };

  lineReader.on('line', params.onLine);
  lineReader.on('close', params.onClose);
  fd.on('error', params.onError);
}





