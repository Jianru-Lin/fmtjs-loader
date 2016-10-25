var fs = require('fs')
var path = require('path')
var request = require('request')

function is_url(str) {
	return /^http(s)?:\/\//i.test(str)
}

function guess_filename(url, res_headers) {
	if (res_headers && res_headers['content-disposition']) {
		return res_headers['content-disposition']
	}
	else {
		var pathname = require('url').parse(url).pathname
		var basename = require('path').basename(pathname)
		return basename
	}
}

function strip_bom(content) {
	if (content.charCodeAt(0) === 65279) {
		content = content.slice(1)
	}
	return content
}

function strip_shebang(content) {
	return content.replace(/^\#\!.*/, "")
}

// load specific file as utf-8 file and return
// the file content without bom and shebang
function load_utf8_file(filename) {
	filename = path.resolve(filename)
	var content = fs.readFileSync(filename, 'utf8')
	return strip_shebang(strip_bom(content))
}

function load_from_url(url, cb) {
	cb = cb || function(err, result) {}

	var opt = {
		gzip: true,
	}
	request(url, function(err, res, body) {
		if (err) {
			cb(err)
		}
		else if (res.statusCode !== 200) {
			cb(new Error('response status code is ' + res.statusCode))
		}
		else {
			var filename = guess_filename(url, res.headers) || hash(body)
			body = body.toString('utf8')
			body = strip_shebang(body)
			var result = {
				filename: filename,
				content: body
			}
			cb(undefined, result)
		}
	})
}

function load(target, cb) {
	var input = {
		filename: null,
		content: null
	}
	if (is_url(target)) {
		
	}
	else {
		try {
			var pathname = path.resolve(target)
			input.filename = path.basename(pathname)
			log.info('read file from ' + JSON.stringify(pathname) + "...")
			input.content = load_utf8_file(pathname)
			cb(null, input)
		}
		catch (err) {
			console.error(err.message)
			cb(err)
		}
	}
}

exports.is_url = is_url
exports.guess_filename = guess_filename
exports.strip_bom = strip_bom
exports.strip_shebang = strip_shebang
exports.is_url = is_url
exports.load_utf8_file = load_utf8_file
exports.load_from_url = load_from_url
exports.load = load
