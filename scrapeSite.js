const axios = require('axios');
const cheerio = require('cheerio');

// Change this to the home page (or any page you want to scrape)
const url = 'https://caviaarmode.com/';

async function scrapePage(targetUrl) {
  try {
    const { data: html } = await axios.get(targetUrl);
    const $ = cheerio.load(html);

    // Try extracting the main headline as an example
    const headline = $('h1').first().text().trim();

    // Example: Extract all product names listed on the homepage
    const productNames = [];
    $('.product-title, .featured-product, .product-card-title').each((i, el) => {
      productNames.push($(el).text().trim());
    });

    console.log('Headline:', headline);
    console.log('Product Names:', productNames);
  } catch (error) {
    console.error('Scraping error:', error.message);
  }
}

scrapePage(url);
