The Site Auditor is a specialized "Digital Underwriter" designed to evaluate the risk profile of e-commerce websites. It essentially acts as a pre-check tool that identifies why a bank or payment processor (like Stripe or PayPal) might flag or shut down a merchant's account.

Here is a breakdown of what it does and how it works:

### What it Does
The auditor scans a website to find "red flags" in three main categories:
1.  **Technical Trust:** It checks if the site is securely built and has a long-standing reputation.
2.  **Marketing & Regulatory Risk:** It looks for aggressive "get rich quick" claims or missing legal disclaimers that attract attention from regulators like the FTC.
3.  **Mandatory Disclosures:** It verifies that the site has all the legally required links in its footer (Refund Policy, Privacy Policy, Terms of Service, etc.).

---

### How it Does It (The "How it Works")

#### 1. The "Stealth" Visit
When you enter a URL, the auditor launches a **Headless Browser** (a web browser without a user interface). It uses a "Stealth Mode" to mimic a real human user so it doesn't get blocked by security systems like Cloudflare while it gathers data.

#### 2. Technical Investigation
The auditor runs several background checks simultaneously:
*   **SSL Handshake:** It verifies the site's encryption certificate to ensure customer data is safe.
*   **WHOIS Lookup:** It checks the domain's "birth certificate" to see how old it is. Newer domains are often flagged as higher risk.
*   **Header Analysis:** It inspects the hidden communication between the server and the browser to check for modern security protections (like HSTS and CSP).

#### 3. Content Extraction & Scanning
Once the page loads, the auditor "reads" the entire site:
*   **Pattern Matching (Regex):** It uses a library of known high-risk phrases (e.g., "100% guaranteed success," "miracle cure"). It scans the text for these triggers.
*   **HTML Parsing (Cheerio):** It digs into the hidden code to find specific links. It doesn't just look for the words "Refund Policy"; it verifies that the link actually exists and points to a valid page.

#### 4. Verification of Authenticity
The auditor performs "Logic Checks" to spot deceptive practices:
*   **Trust Seal Verification:** It looks at security badges (like McAfee or Norton). If it finds a badge that isn't clickable or linked to an actual verification page, it flags it as a "Deceptive Seal."
*   **Payment Gateway Detection:** It scans the code for payment scripts from providers like Stripe or PayPal. This helps determine if the merchant is handling sensitive card data directly (high risk) or using a secure 3rd-party checkout (low risk).

#### 5. Data-Driven Risk Scoring
Finally, the auditor compares its findings against a database of industry statistics. It assigns a **Risk Probability** to each issue (e.g., "Merchants without a Physical Address are 83% more likely to be rejected by banks").

The result is a comprehensive "Risk Report" that tells a business owner exactly what they need to fix before they apply for payment processing.
