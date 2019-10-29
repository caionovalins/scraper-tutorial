const rp = require('request-promise')
const $ = require('cheerio')

const potusParse = url =>
	rp(url).then(html => {
		return {
			name: $('.firstHeading', html).text(),
			birthday: $('.bday', html).text()
		}
	})
	.catch(err => {})

module.exports = potusParse