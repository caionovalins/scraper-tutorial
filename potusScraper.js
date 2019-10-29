const rp = require('request-promise')
const $ = require('cheerio')
const potusParse = require('./potusParse')

const url = 'https://en.wikipedia.org/wiki/List_of_Presidents_of_the_United_States'

const potusScraper = () => {
	rp(url)
		.then(html => {
			const wikiUrls = []
			const parsedHtml = $('big > a', html)
			for (let i = 0; i < parsedHtml.length; i++)
				wikiUrls.push(parsedHtml[i].attribs.href)
			return Promise.all(wikiUrls.map(url => potusParse('https://en.wikipedia.org' + url)))
		})
		.then(presidents => console.log(presidents))
		.catch(err => console.log(err))
}

module.exports = potusScraper