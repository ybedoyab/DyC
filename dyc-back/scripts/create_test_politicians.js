// Script para crear políticos de prueba con email configurado
// Ejecutar con: node scripts/create_test_politicians.js

require('dotenv').config();
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

// Usar la variable de entorno en lugar de hardcodear
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ Error: MONGODB_URI no está definida en el archivo .env');
  process.exit(1);
}

async function createTestPoliticians() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB Atlas');
    
    const db = client.db('dyc-db');
    const politiciansCollection = db.collection('politicians');
    
    // Verificar si ya existen políticos
    const existingCount = await politiciansCollection.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Ya existen ${existingCount} políticos en la base de datos`);
      console.log('¿Quieres continuar y agregar más? (Ctrl+C para cancelar)');
      
      // Esperar 5 segundos para dar tiempo de cancelar
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    // Políticos de prueba
    const testPoliticians = [
      {
        uuid: uuidv4(),
        nombres: "Yulian",
        apellidos: "Bedoya",
        edad: 35,
        sexo: "masculino",
        email: "ybedoyab@unal.edu.co", // Tu email de prueba
        numeroTelefono: "+57 321 805 9894",
        documentoIdentidad: "CC1114150740",
        biografia: "Candidato del partido Dignidad y Compromiso",
        isCandidato: true,
        isActive: true,
        createdBy: "admin_script",
        updatedBy: "admin_script",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid: uuidv4(),
        nombres: "Luisa",
        apellidos: "Vergara",
        edad: 42,
        sexo: "femenino",
        email: "luisavergara.uwu@gmail.com",
        numeroTelefono: "+57 319 593 8947",
        documentoIdentidad: "CC111046295",
        biografia: "Representante del partido Dignidad y Compromiso",
        isCandidato: true,
        isActive: true,
        createdBy: "admin_script",
        updatedBy: "admin_script",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Insertar políticos
    const result = await politiciansCollection.insertMany(testPoliticians);
    
    console.log(`✅ Se crearon ${result.insertedCount} políticos de prueba:`);
    testPoliticians.forEach((politician, index) => {
      console.log(`   ${index + 1}. ${politician.nombres} ${politician.apellidos} - ${politician.email} (${politician.isCandidato ? 'Candidato' : 'Representante'})`);
    });
    
    console.log('\n🎯 Ahora puedes probar el OAuth con estos emails:');
    console.log('   - ybedoyab@unal.edu.co (tu email de prueba)');
    console.log('   - luisavergara.uwu@gmail.com');
    
    console.log('\n📝 Para agregar más políticos, usa el endpoint admin:');
    console.log('   PATCH /api/admin/politicians/:uuid/email');
    
  } catch (error) {
    console.error('❌ Error creando políticos de prueba:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

createTestPoliticians();
