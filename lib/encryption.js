

var fs = require('fs')
var crypto = require('crypto')
var requirelib = require('requirelib')
var util = requirelib('util')

var Encryptor = {}

/**
 * Giving a string, salt (aka key), and IV (Initial Vector) as input, 
 * encrypt the input string and output it as an encrypted string
 * 
 * @param  {String} inputText
 * @param  {String} salt
 * @param  {String} iv
 */
Encryptor.encryptText = function(inputText, salt, iv) {

	var inputBuffer = new Buffer(inputText, 'utf8')
	var outputBuffer = Encryptor.encryptBuffer(inputBuffer, salt, iv)
	return outputBuffer.toString('base64')
}

/**
 * Giving a buffer, salt (aka key), and IV (Initial Vector) as input, 
 * encrypt the input buffer and output it as an encrypted buffer
 * 
 * @param  {Buffer} inputBuffer
 * @param  {String} salt
 * @param  {String} iv
 */
Encryptor.encryptBuffer = function(inputBuffer, salt, iv) {

	var algorithm = util.getAlgorithm(salt, iv)
	var padding = util.getPad()
	var encipher = crypto.createCipheriv(algorithm, salt, iv)
	var outputBuffer = Buffer.concat([padding, inputBuffer])
	return Buffer.concat([new Buffer(encipher.update(outputBuffer), 'utf8'), new Buffer(encipher.final('utf8'), 'utf8')])
}

/**
 * Giving input file path, output file path, salt, and IV as input, 
 * encrypt the input file and output it to output file.
 * 
 * @param  {String} inputFile
 * @param  {String} outputFile
 * @param  {String} salt
 * @param  {String} iv
 */
Encryptor.encryptFileSync = function encryptFileSync(inputFile, outputFile, salt, iv) {
	
	var inputBuffer = fs.readFileSync(inputFile)
	var outputBuffer = Encryptor.encryptBuffer(inputBuffer, salt, iv)
	fs.writeFileSync(outputFile, outputBuffer)
}

Encryptor.encryptFile = function encryptFile(inputFile, outputFile, salt, iv, callback) {
	
	if (undefined === callback) return Encryptor.encryptFile.bind(null, inputFile, outputFile, salt, iv)
	
	var algorithm = util.getAlgorithm(salt, iv)
	var encipher = crypto.createCipheriv(algorithm, salt, iv)
	
	var inputStream = fs.createReadStream(inputFile)
	var outputStream = fs.createWriteStream(outputFile)
	
	var padding = util.getPad()
	outputStream.write(new Buffer(encipher.update(padding), 'utf8'))
	
	inputStream.on('data', function(data) {
		var buf = new Buffer(encipher.update(data), 'utf8')
		outputStream.write(buf)
	})

	inputStream.on('end', function() {
		var buf = new Buffer(encipher.final('utf8'), 'utf8')
		outputStream.write(buf)
		outputStream.end()
		outputStream.on('prefinish', function() {
			callback()
		})
	})
	
	inputStream.on('error', function(err) {
		callback(new Error('Failed to encrypt file: ' + err.message))
	})
}

module.exports = Encryptor