const FIELD_MAPPINGS = {
    'marque (from Véhicule en stock)': 'marque',
    'modele (from Véhicule en stock)': 'modele',
    'photo_exterieur (from Véhicule en stock)': 'photos',
    'VIN (from Véhicule en stock)': 'vin',
    "Date d'enlèvement": 'date_enlevement',
    'Attachments (from Signature)': 'attachments',
    'Prénom (from Chauffeurs)': 'prenom_chauffeur',
    'Nom (from Chauffeurs)': 'nom_chauffeur',
    'Entreprise (from Chauffeurs)': 'entreprise_chauffeur',
    'Numéro ID (from Chauffeurs)': 'id_chauffeur',

    // autres mappings...
  };
  
  export function normalizeData(rawData) {
    const normalized = {};
  
    for (const [originalKey, newKey] of Object.entries(FIELD_MAPPINGS)) {
      const value = rawData[originalKey];
  
      if (Array.isArray(value)) {
        // Cas tableau (ex: photos ou linked records)
        if (value.length > 0 && value[0]?.url) {
          // Tableau d'images
          normalized[newKey] = value.map(p => ({ url: p.url }));
        } else if (value.length > 0 && typeof value[0] === 'object') {
          // Tableau linked records - extraire un champ simple (ex: "name" ou "fields.name")
          // Adapter selon ta structure exacte
          normalized[newKey] = value.map(item => {
            if (typeof item === 'string') return item; // si juste ID ou string
            if (item.fields && item.fields.Name) return item.fields.Name;
            if (item.name) return item.name;
            return JSON.stringify(item); // fallback
          }).join(', '); // concaténer en string simple
        } else {
          normalized[newKey] = value.join(', '); // tableau de strings simple
        }
      } else if (typeof value === 'object' && value !== null) {
        // Cas objet lié simple
        if (value.fields && value.fields.Name) {
          normalized[newKey] = value.fields.Name;
        } else if (value.name) {
          normalized[newKey] = value.name;
        } else {
          normalized[newKey] = JSON.stringify(value);
        }
      } else {
        // Cas valeur simple (string, number...)
        normalized[newKey] = value;
      }
    }
  
    // Ajouter les champs non-mappés directement
    for (const key in rawData) {
      if (!Object.keys(FIELD_MAPPINGS).includes(key)) {
        normalized[key] = rawData[key];
      }
    }
  
    return normalized;
  }
  