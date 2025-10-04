import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeFlipkartPrice(url) {
  try {
    const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
    
    // Use ScraperAPI if available, otherwise direct request
    const requestUrl = SCRAPER_API_KEY 
      ? `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`
      : url;

    const headers = SCRAPER_API_KEY ? {} : {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    };

    const { data } = await axios.get(requestUrl, {
      headers,
      timeout: 30000,
    });

    const $ = cheerio.load(data);

    // Extract price - based on your HTML structure
    let priceText = 
      $('.Nx9bqj.CxhGGd').first().text() ||  // Main price selector
      $('.Nx9bqj').first().text() ||
      $('._30jeq3').first().text();

    // Clean price and convert to number
    const price = parseInt(priceText.replace(/[^0-9]/g, ''));

    // Extract product name
    const productName = 
      $('.VU-ZEz').first().text().trim() ||
      $('._6EBuvT .VU-ZEz').first().text().trim() ||
      $('h1.yhB1nd').first().text().trim() ||
      'Unknown Product';

    // Extract product image
    const productImage = 
      $('.DByuf4.IZexXJ.jLEJ7H').first().attr('src') ||
      $('img[alt*="iPhone"]').first().attr('src') ||
      $('._396cs4').first().attr('src');

    console.log('Extracted data:', { price, productName, productImage });

    if (!price || isNaN(price)) {
      throw new Error('Could not extract price from page');
    }

    return {
      price,
      productName,
      productImage: productImage || null,
    };
  } catch (error) {
    console.error('Scraping error:', error.message);
    throw new Error('Failed to scrape Flipkart. Make sure the URL is correct.');
  }
}
