const axios = require('axios');
(async () => {
    try {
        const res = await axios.post('https://edp-kyc-visionaudit.onrender.com', { url: 'https://drinkag1.com' });
        console.log(JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error(e.message);
    }
})();
