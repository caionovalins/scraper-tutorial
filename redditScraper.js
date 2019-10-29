const puppeteer = require('puppeteer')
const $ = require('cheerio')
const url = 'https://www.reddit.com'

const wait = (ms) => new Promise(resolve => setTimeout(() => resolve(), ms))

const redditScraper = async (numPosts) => {

	const browser = await puppeteer.launch()
	const page = await browser.newPage()

	await page.goto(url)
	let html = await page.content()
	let parsedHtml = $('h3', html)

	const viewportHeight = page.viewport().height
	let numScrollAttempts = 0
	const maxTries = 150

	const postTitles = new Set()

	while (postTitles.size < numPosts && numScrollAttempts <= maxTries) {
		await page.evaluate(() => window.scrollBy(0, window.innerHeight))
		await wait(500)
		html = await page.content()
		parsedHtml = $('h3', html)
		for (let i = 0; i < parsedHtml.length && postTitles.size < numPosts; i++)
			postTitles.add(parsedHtml[i].children[0].data)
		console.log(`scroll attempt #${++numScrollAttempts}, got ${parsedHtml.length} posts and ${postTitles.size} unique titles`)
	}

	if (numScrollAttempts <= maxTries) {
		console.log(`here are the titles of the first ${numPosts} posts from reddit`)
		let index = 0
		postTitles.forEach((title) => console.log(`\t${++index}. ${title}`))
	} else {
		console.log(`tried ${maxTries} times to scroll the page but could not load posts`)
	}

	await browser.close()
	console.log('end of scraper, browser closed')

}

module.exports = redditScraper