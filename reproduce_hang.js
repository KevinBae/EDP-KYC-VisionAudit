import axios from 'axios';

async function reproduceHang() {
  const url = 'https://drinkag1.com';
  console.log(`[Reproduction] Testing audit for: ${url}`);
  
  try {
    const startTime = Date.now();
    const response = await axios.post('http://localhost:3000/api/audit', {
      url
    }, {
      timeout: 120000 // 2 minute timeout for the request itself
    });
    
    const endTime = Date.now();
    console.log(`[Reproduction] Audit completed in ${(endTime - startTime) / 1000}s`);
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error(`[Reproduction] Server returned error (${error.response.status}):`, error.response.data);
    } else {
      console.error(`[Reproduction] Error during audit: ${error.message}`);
    }
  }
}

reproduceHang();
