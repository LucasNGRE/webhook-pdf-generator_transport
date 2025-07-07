import Airtable from 'airtable';

const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_ID);

export async function getRecordById(recordID){
    try {
        const record = await base('Bilan VO').find(recordID);
        return record.fields;
    }
    catch (error) {
        console.error("Error fetching record:", error);
        throw new Error("Failed to fetch record");
    }
}

export async function updateRecord(recordId, fieldsToUptade) {

    try {
        const updatedRecord = await base('Bilan VO').update(recordId, fieldsToUptade);
        return updatedRecord.fields;
    }
    catch (error) {
        console.error("Error updating record:", error);
        throw new Error("Failed to update record");
    }
}