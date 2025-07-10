import Airtable from 'airtable';

function getBase() {
  if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
    throw new Error('Airtable API key or Base ID missing');
  }
  return new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
}

export async function getRecordById(recordID) {
  try {
    const base = getBase();
    const record = await base('Bilan VO').find(recordID);
    return record.fields;
  } catch (error) {
    console.error('Error fetching record:', error);
    throw new Error('Failed to fetch record');
  }
}

export async function updateRecord(recordId, fieldsToUpdate) {
  try {
    const base = getBase();
    const updatedRecord = await base('Bilan VO').update(recordId, fieldsToUpdate);
    return updatedRecord.fields;
  } catch (error) {
    console.error('Error updating record:', error);
    throw new Error('Failed to update record');
  }
}
