## 1. Verify Your Domain in Google Search Console
Search Engines need to know you are the owner of `https://www.ledovalley.com`.
- **Where to find it**: Go to [Google Search Console](https://search.google.com/search-console/welcome).
- **Setup**: Add your domain. Google will then ask you to "Verify Ownership".
- **Choose the 'HTML File' method**: 
  - Download the small `.html` file they provide.
  - **Upload that file here to me**, and I will place it in your `public` folder immediately.
- **Alternative (DNS TXT)**: If you choose the DNS method, copy the "TXT Record" code and add it to your domain provider's DNS panel.

## 2. Submit Your New Dynamic Sitemap
I have implemented a dynamic sitemap for you at `https://www.ledovalley.com/sitemap.xml`.
- In Search Console, go to **Index** > **Sitemaps**.
- Enter `sitemap.xml` and click **Submit**.
- This tells Google exactly where all your new products and pages are.

## 3. Request "Priority Re-indexing" for the Homepage
This is the fastest way to change the "Wix" snippet to the new "Ledo Valley" snippet in search results.
- In Search Console, paste your homepage URL (`https://www.ledovalley.com/`) into the **Top Search Bar**.
- Click **Request Indexing**.
- Google will usually prioritize this crawl, often updating your search snippet within 24–48 hours.

## 4. Check for Broken Links (301 Redirects)
If your old Wix site had pages like `ledovalley.com/our-tea` but the new one is `ledovalley.com/about`, you should set up redirects in your `next.config.ts`.
- This "passes the SEO power" from the old Wix page to the new Next.js page.
- *If you have a list of old URLs, I can help you set up these redirects!*

---

> [!IMPORTANT]
> **Patience is Key**: Even after requesting an update, Google might take a few days to fully refresh its global index. Your new metadata is correctly set up in the code, so it's just a matter of the "Google Bot" visiting the site.
