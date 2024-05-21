const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Fungsi untuk membaca query dari file
const readQueriesFromFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return data.split(/\r?\n/).filter(line => line.trim() !== '');
  } catch (error) {
    console.error(`Error reading file from disk: ${error}`);
    return [];
  }
};

// Membaca query dari file token.txt
const queries = readQueriesFromFile(path.join(__dirname, 'token.txt'));

// Fungsi untuk melakukan validasi dan mendapatkan token
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

// Fungsi untuk melakukan auto click
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

    let data = {
      "clicks": 50
    };

    const response = await axios.post(
      'https://db4.onchaincoin.io/api/klick/myself/click',
      data,
      { headers }
    );

    if (response.data.message && response.data.message.includes("Insufficient energy")) {
      console.log('Insufficient energy');
      setTimeout(() => autoClick(token), 60000); // Wait for 60 seconds before retrying
    } else {
      console.log('Click successful:', response.data);
    }
  } catch (error) {
    console.error(`Error performing click: ${error}`);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

// Fungsi utama untuk menjalankan bot secara infinite looping
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
