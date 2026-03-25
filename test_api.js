import fetch from 'node-fetch';

async function testAudit() {
  const url = 'https://www.shopify.com';
  console.log(`Testing audit for: ${url}`);
  
  const response = await fetch('https://edp-kyc-visionaudit.onrender.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  
  const data = await response.json();
  const marketing = data.results.find(r => r.id === 'marketing');
  console.log(JSON.stringify(marketing, null, 2));
}

testAudit();
