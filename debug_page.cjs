const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.toString());
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
       console.log('CONSOLE ERROR:', msg.text());
    }
  });

  console.log("Navigating to login...");
  await page.goto('http://localhost:5173/hq-rockshill/login');
  
  await page.waitForSelector('input[type="password"]');
  await page.type('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation();
  console.log("Navigating to confirmed...");
  await page.goto('http://localhost:5173/hq-rockshill/confirmed');
  
  await page.waitForSelector('.bx-edit', { timeout: 5000 }).catch(() => console.log('No edit button found'));
  
  const editButtons = await page.$$('.bx-edit');
  if (editButtons.length > 0) {
      console.log("Clicking Edit Reservasi...");
      
      const [response] = await Promise.all([
         page.waitForNavigation().catch(() => {}), // wait for url change
         editButtons[0].click(),
      ]);
      await page.waitForTimeout(3000);
  } else {
      console.log("Could not find edit button");
  }
  
  await browser.close();
})();
