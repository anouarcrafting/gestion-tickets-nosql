const bcryptjs = require('bcryptjs');
const { MongoClient, ObjectId } = require('mongodb');

// Connexion à la base de données MongoDB
const uri = 'mongodb://localhost:27017'; // Remplace par l'URI de ta base de données MongoDB
const dbName = 'ticket_db'; // Remplace par le nom de ta base de données

async function hashTechnicienPasswords() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('Techniciens'); // Remplace par le nom de ta collection

    // Recherche des employés
    const Techniciens = await collection.find().toArray();
    
    // Pour chaque employé, hacher le mot de passe
    for (let Technicien of Techniciens) {
      const hashedPassword = await bcryptjs.hash(Technicien.motDePasse, 10); // Hachage du mot de passe

      // Mise à jour de l'employé avec le mot de passe haché
      await collection.updateOne(
        { _id: new ObjectId(Technicien._id) }, // Correction ici : utilisation de new ObjectId
        { $set: { motDePasse: hashedPassword } }
      );

      console.log(`Mot de passe de ${Technicien.nom} mis à jour avec succès.`);
    }
  } catch (err) {
    console.error('Erreur lors de la mise à jour des mots de passe :', err);
  } finally {
    await client.close();
  }
}

hashTechnicienPasswords();
// Appelle la fonction pour hacher les mots de passe des techniciens