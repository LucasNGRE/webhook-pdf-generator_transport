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
    // Utilisation de la variable d'environnement TABLE_NAME
    const tableName = process.env.TABLE_NAME;
    if (!tableName) throw new Error('TABLE_NAME missing');
    const record = await base(tableName).find(recordID);
    return record.fields;
  } catch (error) {
    console.error('Error fetching record:', error);
    throw new Error('Failed to fetch record');
  }
}

export async function updateRecord(recordId, fieldsToUpdate) {
  try {
    const base = getBase();
    const tableName = process.env.TABLE_NAME;
    if (!tableName) throw new Error('TABLE_NAME missing');
    const updatedRecord = await base(tableName).update(recordId, fieldsToUpdate);
    return updatedRecord.fields;
  } catch (error) {
    console.error('Error updating record:', error);
    throw new Error('Failed to update record');
  }
}
