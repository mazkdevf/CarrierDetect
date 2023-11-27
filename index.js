const puppeteer = require('puppeteer-extra')
const AdBlockerPlugin = require('puppeteer-extra-plugin-adblocker')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const cheerio = require('cheerio');

puppeteer.use(StealthPlugin())
puppeteer.use(AdBlockerPlugin({ blockTrackers: true }))

class CarrierDetect {
    constructor() { }

    fetchCookie = async () => new Promise(async (resolve) => {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.goto('https://freecarrierlookup.com/', { waitUntil: 'networkidle2' });
        await page.waitForSelector('#cc');
        const cookies = await page.cookies();
        await browser.close();
        console.log(cookies)
        resolve(cookies);
    });

    fetchCarrier = async (country, phoneNum) => new Promise(async (resolve, reject) => {
        try {
            let cookies = await this.fetchCookie();
            await new Promise(resolve => setTimeout(resolve, 2000));

            const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
            const page = await browser.newPage();
            await page.setCookie(...cookies);

            await page.goto('https://freecarrierlookup.com/', { waitUntil: 'networkidle2' });

            await page.waitForSelector('#cc');

            await page.evaluate(() => {
                document.querySelector('#cc').value = '';
            });
            await page.type('#cc', country);
            await page.waitForSelector('#phonenum');
            await page.type('#phonenum', phoneNum);
            await page.waitForTimeout(2500)
            await page.waitForSelector('[type="submit"]');
            await page.click('[type="submit"]');

            await page.waitForTimeout(4000)
            let $ = await cheerio.load(await page.content());
            await browser.close();
            let carrier = await $('#search-result').find('strong:contains("Carrier:")').parent().next().text().trim();

            resolve({
                success: (carrier !== '') ? true : false,
                carrier: carrier || null
            });
        } catch (error) {
            reject({
                success: false,
                carrier: null,
                err: error
            });
        }
    });
}

async function main() {
    const identifier = new CarrierDetect();
    let carrier = await identifier.fetchCarrier("<country code>", "<number without country>");
    if (carrier.success) {
        console.log(carrier.carrier);
    } else {
        console.log(carrier.err);
    }
}

main();