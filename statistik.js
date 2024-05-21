const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Read the tokens from token.txt
const tokenPath = path.resolve(__dirname, 'token.txt');

fs.readFile(tokenPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading token file:', err);
    return;
  }

  const tokens = data.split('\n').map(token => token.trim()).filter(token => token !== '');

  function checkStatistics(index) {
    if (index >= tokens.length) {
      console.log('All tokens processed.');
      return;
    }

    const token = tokens[index];
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://www.thecubes.xyz',
        'Referer': 'https://www.thecubes.xyz/',
        'Sec-Ch-Ua': '"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99", "Microsoft Edge WebView2";v="124"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Priority': 'u=1, i'
      }
    };

    axios.post(`https://server.questioncube.xyz/game/mined?token=${token}`, config)
      .then((response) => {
        console.log(`Token ${index + 1} Statistics:`, response.data);
        setTimeout(() => checkStatistics(index + 1), 10); // Move to next token immediately
      })
      .catch((error) => {
        console.error('Error:', error.message);
        setTimeout(() => checkStatistics(index + 1), 10); // Retry after error
      });
  }

  setTimeout(checkStatistics(0),1000);
});
