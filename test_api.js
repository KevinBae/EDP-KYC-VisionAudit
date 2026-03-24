import fetch from 'node-fetch';

async function testAudit() {
  const url = 'https://www.shopify.com';
  console.log(`Testing audit for: ${url}`);
  
  const response = await fetch('http://localhost:3000/api/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  
  const data = await response.json();
  const marketing = data.results.find(r => r.id === 'marketing');
  console.log(JSON.stringify(marketing, null, 2));
}

testAudit();
