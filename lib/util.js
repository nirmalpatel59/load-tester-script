
var slice = Array.prototype.slice
, qsparse = require('querystring').parse
, crypto = require('crypto')
, oauth = require('oauth')
, request = require('request')
, get = request.defaults({ json: true }).get
, ObjectId = require('mongoose').Types.ObjectId
, bufferjoiner = require('bufferjoiner')
, mime = require('mime')
, requirelib = require('requirelib')
, encryption = requirelib('encryption')
, hbs = require('handlebars')

/**
* Creates a password+salt hash
*
* @param  {String} password The password
* @param  {String} salt     Password salt,
*                           defaults to randomBytes
* @return {Object}          { password, salt}
*/

exports.sha = function sha(password, salt) {
salt = salt || crypto.randomBytes(30).toString('base64')
return {
  salt: salt,
  password: crypto.createHash('sha256').update(password + salt).digest('hex')
}
}

/**
* Get a deep value in a dictionary given
* a dot delimited path
*
* @param  {Object} obj  The password
* @param  {String} path The value path
* @return {Mixed}       The value
*/

exports.deep = function deep(obj, path) {
if (!obj) return undefined
if (!path) return obj

path.split('.').every(function (part) {
  return (obj = obj[part])
})

return obj
}

exports.encryptJson = function encryptJson(data, salt, iv) {
  if(typeof(data) === 'object') {
      data = JSON.stringify(data)
  }
  return encryption.encryptText(data, salt, iv)
}


exports.checkParams = function checkParams(/* target, keys... */) {
var params = slice.call(arguments)
var target = params.shift()
var callback = 'function' === typeof params[params.length-1] ? params.pop() : undefined
var filter = params.filter(function (param) {
  return undefined == target[param] || '' === target[param]
})

if (filter.length) {
  var err = new Error('Missing parameter(s) [' + filter.join(', ') + ']')

  if (callback) {
    callback(err)
    return false
  }

  throw err
}

return true
}

exports.getAlgorithm = function getAlgorithm(salt, iv) {
  var algorithm = 'aes-256-cfb8'
  var length = salt.length
  if(length == 16) {
      algorithm = 'aes-128-cfb8'
  } else if(length == 24) {
      algorithm = 'aes-192-cfb8'
  } else if(length == 32) {
      algorithm = 'aes-256-cfb8'
  } else {
      throw new Error('Failed to encrypt: invalid salt length ' + length)
  }

  if(iv.length != 16) {
      throw new Error('Failed to encrypt: invalid IV length ' + iv.length)
  }
  return algorithm;
}

/**
* Int to ObjectId
*
* @param  {Number}   n Decimal representation of _id
* @return {ObjectId}   MongoDb ObjectId
*/

var oid = exports.oid = function oid(n) {
return new ObjectId(id(n))
}

/**
* Int to string with padding (24)
*
* @param  {Number} n Input number
* @return {String}   32 chars string version of `n`
*/

var id = exports.id = function id(n) {
var l = n.toString().length
return '000000000000000000000000'.substr(l) + n
}

/**
* format date according to the specified format
*/
exports.formatDate = function (date, fmt) {
  var o = {
      "M+": date.getMonth() + 1,
      "d+": date.getDate(),
      "h+": date.getHours(),
      "m+": date.getMinutes(),
      "s+": date.getSeconds(),
      "q+": Math.floor((date.getMonth() + 3) / 3),
      "S": date.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}


/**
* The padding string (a 24 byte array) which will be prepended to the actual plaintext
* <secure random long number>:<current time in ms>\n
*/
exports.getPad = function getPad() {
  var max = 9999999999999999999
  var min = 1000000000000000000
  var time = new Date().getTime()
  var long = Math.ceil(Math.random()*(max-min)+min)
  var buffers = bufferjoiner()
  var header = new Buffer(6)
  header.fill(0)
  buffers.add(header)// reserved 6 bytes
  buffers.add(new Buffer(exports.num2hex(long), 'hex'))//random long number (8 bytes)
  buffers.add(new Buffer(':'))
  buffers.add(new Buffer(exports.num2hex(time), 'hex'))//current time in ms (8 bytes)
  buffers.add(new Buffer('\n'))
  return buffers.join()
}

/**
* convert a Number to Hex String
*
* @param  {Number} number
* @param  {String} padding
*/
exports.num2hex = function num2hex(num, padding) {
  var hex = Number(num).toString(16)
  padding = typeof (padding) === "undefined" || padding === null ? 16 : padding;
  while (hex.length < padding) {
      hex = "0" + hex
  }
  return hex;
}

exports.token = function token() {
return exports.sha(Date.now() + Math.random).password
}

exports.getTextByTag = function tags() {
  return {
      'any':'Any',
      'northeast':'Northeast',
      'midwest':'Midwest',
      'south':'South',
      'west':'West',
      'sales':'Sales',
      'technology':'Technology',
      'operations':'Operations',
      'finance':'Finance',
      '0':'None',
      '1y':'1+ Years',
      '3y':'3+ Years',
      '5y':'5+ Years',
      '10y':'10+ Years',
      'boe':'Based on Experience',
      '25k':'>= 25K',
      '50k':'>= 50K',
      '75k':'>= 75K',
      '100k':'>= 100K',
      'yes':'Yes',
      'no':'No',
      'pt':'Part-Time',
      'ft':'Full-Time'
  }
}

exports.uniqueArray = function uniqueArray(arr) {
  var result = [], hash = {};
  for (var i = 0, elem; (elem = arr[i]) != null; i++) {
      if (!hash[elem]) {
          result.push(elem);
          hash[elem] = true;
      }
  }
  return result;
}



/**
* check if the type of the uploaded file is valid. The supported file types are as follows:
*  0 (for recording): MP4
*  1 (for resume): PDF, Word document, Text file (UTF-8), Formatted Text File (Rich-text), some standard image formats (png, jpg, gif, tiff)
*/
exports.validateFile = function validateFile(filepath, type) {
  var supportedTypes = [
      [
        'video/webm',
          'video/mp4', //Video MP4
          'audio/mp4', //Audio MP4
        'video/quicktime'
      ], [
           'application/pdf', //PDF
           'application/vnd.openxmlformats-officedocument.wordprocessingml.document', //Word 2007+
           'application/msword', //Word 97
           'text/plain', //Text file
           'application/rtf', //Formatted Text File
           'image/png', //PNG
           'image/jpeg', //JPG
           'image/gif', //GIF
           'image/tiff' //TIFF
       ]
  ]
  var filetype = mime.lookup(filepath)
  return supportedTypes[type].indexOf(filetype) > -1
}


/**
* give template info like template, subject and enable Mail
*
* @param  {Object} organization
* @param  {String} emailType
*/

exports.getTemplateObj = function (organization, emailType) {
  var mailinfo = {};
  var templateObj = {};

  // get selected mail template information from setting
  if (organization && organization.setting && organization.setting.mails && organization.setting.mails.length > 0) {
      mailinfo = organization.setting.mails.find(function (mail) {
          if (emailType == mail.emailType) return mail;
      });
  }

  // if main template not found throw error
  if (!mailinfo) {
      this.throw("No such email template found in this organization")
  }
  var finalTemplate = '';

  // attach header in email template
  if (mailinfo.includeHeader && organization && organization.setting 
      && organization.setting.header) {
      finalTemplate = finalTemplate + organization.setting.header;
  }
  // attach body in email template
  finalTemplate = finalTemplate + mailinfo.template;
  // attach footer in email template
  if (mailinfo.includeFooter && organization && organization.setting 
      && organization.setting.footer) {
      finalTemplate = finalTemplate + organization.setting.footer;
  }

  // prepare return template object information
  templateObj.template = hbs.compile(finalTemplate);
  templateObj.subject = mailinfo.subject;
  templateObj.enableMail = mailinfo.enableMail;

  return  templateObj;
}