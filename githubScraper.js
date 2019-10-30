const puppeteer = require('puppeteer')
const $ = require('cheerio')
const ENV = require('./env')

const login = async (page) => {
	await page.goto('https://github.com/login')
	const USERNAME_SELECTOR = '#login_field'
	const PASSWORD_SELECTOR = '#password'
	const BUTTON_SELECTOR = '#login > form > div.auth-form-body.mt-3 > input.btn.btn-primary.btn-block'
	await page.click(USERNAME_SELECTOR)
	await page.keyboard.type(ENV.username)
	await page.click(PASSWORD_SELECTOR)
	await page.keyboard.type(ENV.password)
	await page.click(BUTTON_SELECTOR)
}

const scrapePage = async (webPage, url, pageNum) => {
	const searchUrl = `${url}&p=${pageNum}`
	await webPage.goto(searchUrl)
	const html = await webPage.content()
	if ($('#user_search_results > div.user-list', html).length < 1) {
		return undefined
	} else {
		const emails = []
		const parsedHtml = $('#user_search_results > div.user-list > div > div > div > div > a.muted-link', html)
		for (let i = 0; i < parsedHtml.length; i++)
			emails.push(parsedHtml[i].children[0].data)
		return emails
	}
}

const scrapeEmails = async (userToSearch, numEmails) => {
	const browser = await puppeteer.launch()
	const page = await browser.newPage()
	await login(page)
	const baseSearchUrl = `https://github.com/search?q=${userToSearch}&type=Users`
	let emails = []
	let stop = false
	let numPage = 1
	do {
		console.log(`Scraping page ${numPage}. Currently have ${emails.length} emails.`)
		const scrapedEmails = await scrapePage(page, baseSearchUrl, numPage++)
		if (scrapedEmails === undefined)
			stop = true
		else
			emails = emails.concat(scrapedEmails)
	} while(emails.length < numEmails && !stop)
	emails = emails.slice(0, numEmails)
	console.log(`Done getting ${emails.length} emails:`, emails)
	await browser.close()
}

scrapeEmails('jia li', 50)