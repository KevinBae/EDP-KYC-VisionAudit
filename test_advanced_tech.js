import axios from 'axios';
import fs from 'fs';

async function testAudit() {
    const url = 'https://www.drinkag1.com';
    let output = `[Test] Auditing ${url}...\n`;
    
    try {
        const response = await axios.post('http://localhost:3000/api/audit', { url });
        const data = response.data;
        const techResults = data.results.find(r => r.id === 'tech');
        const techDetails = techResults.details;
        
        output += "\n--- Technical Trust Analysis Results ---\n";
        output += `Overall Status: ${techResults.status}\n`;
        
        techDetails.forEach(d => {
            output += `[${d.status.toUpperCase()}] ${d.label}: ${d.note}\n`;
        });
        
        if (techDetails.length >= 7) {
            output += `\n✅ Success: Found ${techDetails.length} itemized technical trust checks.\n`;
        } else {
            output += `\n❌ Error: Only found ${techDetails.length} checks.\n`;
        }
        
    } catch (err) {
        output += `Test failed: ${err.response?.data || err.message}\n`;
    }
    
    fs.writeFileSync('test_results.txt', output, 'utf8');
    console.log("Results written to test_results.txt");
}

testAudit();
