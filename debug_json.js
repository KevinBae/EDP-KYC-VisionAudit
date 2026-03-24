const axios = require('axios');
(async () => {
    try {
        const res = await axios.post('http://localhost:3000/api/audit', { url: 'https://drinkag1.com' });
        console.log(JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error(e.message);
    }
})();
