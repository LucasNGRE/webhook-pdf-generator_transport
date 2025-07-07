const FIELD_MAPPINGS = {
    'marque (from Véhicule en stock)': 'marque',
    'modele (from Véhicule en stock)': 'modele',
    'photo_exterieur (from Véhicule en stock)': 'photos',
    'Pneus & jantes - Photos': 'photosInterieur',
    'BilanVO - titre' : 'bilanVO',
    'version (from Véhicule en stock)': 'version',
    'annee (from Véhicule en stock)': 'annee',
    'energie (from Véhicule en stock)': 'energie',
    'VIN (from Véhicule en stock)': 'vin',
    'reference (from Véhicule en stock)': 'reference',
    'Pneus - État': 'etatPneus',
    'Pneus - Indice de charge' : 'indiceChargePneus',
    'Pneus - Indice de vitesse': 'indiceVitessePneus',
    'Pneus & jantes - Photos': 'photosPneusJantes',
    'Amortisseurs - Anomalie ?': 'anomalieAmortisseurs',
    'Disques & plaquettes - État': 'etatDisquesPlaquettes',
    'Disques & plaquettes - Raison changement': 'raisonChangementDisquesPlaquettes',
    'Disques & plaquettes - Photos': 'photosDisquesPlaquettes',
    'Amortisseurs - Photos': 'photosAmortisseurs',
    'Dessous de voiture - Photos': 'photosDessousVoiture',
    'BilanVO - titre': 'bilanVO',


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
  