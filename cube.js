const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Read queries from file
const readQueriesFromFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return data.split(/\r?\n/).filter(line => line.trim() !== '');
  } catch (error) {
    console.error(`Error reading file from disk: ${error}`);
    return [];
  }
};

// Queries from token.txt
const queries = readQueriesFromFile(path.join(__dirname, 'token.txt'));

// Validate and get token
const validateQuery = async (query) => {
  try {
    const payload = { hash: query };
    console.log('Sending payload:', payload);

    const response = await axios.post(
      'https://db4.onchaincoin.io/api/validate',
      payload,
      {
        headers: {
          'accept': 'application/json, text/plain, */*',
          'accept-language': 'en-US,en;q=0.5',
          'content-type': 'application/json',
          'origin': 'https://db4.onchaincoin.io',
          'referer': 'https://db4.onchaincoin.io/',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'te': 'trailers',
        },
      }
    );
    console.log('Response data:', response.data);
    return response.data.token;
  } catch (error) {
    console.error(`Error validating query: ${error}`);
    return null;
  }
};

// Countdown timer function
const countdown = (t) => {
  return new Promise(resolve => {
    const interval = setInterval(() => {
      let menit, detik, jam;
      [menit, detik] = divmod(t, 60);
      [jam, menit] = divmod(menit, 60);
      jam = String(jam).padStart(2, '0');
      menit = String(menit).padStart(2, '0');
      detik = String(detik).padStart(2, '0');
      process.stdout.write(`waiting until ${jam}:${menit}:${detik} \r`);
      t -= 1;
      if (t < 0) {
        clearInterval(interval);
        process.stdout.write("                          \r");
        resolve();
      }
    }, 1000);
  });
};

// Auto click function
const autoClick = async (token) => {
  try {
    const headers = {
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'en-US,en;q=0.5',
      'content-type': 'application/json',
      'origin': 'https://db4.onchaincoin.io',
      'referer': 'https://db4.onchaincoin.io/',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'te': 'trailers',
      'authorization': `Bearer ${token}`,
    };

    const data = {
      "clicks": 50
    };

    const response = await axios.post(
      'https://db4.onchaincoin.io/api/klick/myself/click',
      data,
      { headers }
    );

    console.log('Click successful:', response.data);

  } catch (error) {
    const headers = {
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'en-US,en;q=0.5',
      'content-type': 'application/json',
      'origin': 'https://db4.onchaincoin.io',
      'referer': 'https://db4.onchaincoin.io/',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'te': 'trailers',
      'authorization': `Bearer ${token}`,
    };

    if (error.response) {
      const errorMessage = error.response.data.error;
      
      if (errorMessage && errorMessage.includes("Insufficient energy")) {
        console.log('Insufficient energy');
        
        // Check if energy boost is available
        try {
          const boostResponse = await axios.post(
            'https://db4.onchaincoin.io/api/boosts/energy',
            {},
            { headers }
          );

          if (boostResponse.data.success) {
            console.log('Successfully used energy boost');
            return autoClick(token); // Retry click after using boost
          } else {
            console.log('Failed to use energy boost, starting countdown');
            return autoClick(token);
          }
        } catch (boostError) {
        }
      } else {
        await countdown(600); 
        return autoClick(token);
      }
      
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};


// Infinite loop for running the bot
const runBot = async () => {
  while (true) {
    for (const query of queries) {
      const token = await validateQuery(query);
      if (token) {
        await autoClick(token);
      } else {
        console.error('Failed to get token');
      }
    }
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before restarting the loop
  }
};

runBot();

// Helper function to divide and mod values
const divmod = (a, b) => {
  return [Math.floor(a / b), a % b];
};