require('dotenv').config();

console.log('API KEY:', process.env.AIRTABLE_API_KEY); // pour vérifier

const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appqyvCdKQYpQuD7G');

async function testUpdateRecord() {
  try {
    const recordId = 'recTfQJbHYT4GF2nK';
    const updated = await base('Bilan VO').update(recordId, {
      'test-pdf': 'Valeur test mise à jour'
    });
    console.log('Mise à jour réussie:', updated);
  } catch (error) {
    console.error('Erreur mise à jour:', error);
  }
}

testUpdateRecord();
