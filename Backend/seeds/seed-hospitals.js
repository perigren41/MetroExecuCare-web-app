const { pool } = require('../config/database/connection');

async function seedHospitals() {
  try {
    console.log('🔄 Adding sample hospital data...');
    
    const hospitals = [
      {
        name: 'The Medical City',
        address: '9 Ortigas Avenue, Ortigas Center, Pasig City',
        city: 'Pasig City',
        contact_number: '+632-8-635-6789',
        email: 'info@themedicalcity.com',
      },
      {
        name: 'St. Luke\'s Medical Center',
        address: '279 E. Rodriguez Sr. Avenue, Quezon City',
        city: 'Quezon City', 
        contact_number: '+632-8-723-0101',
        email: 'info@stluke.com.ph',
      },
      {
        name: 'Asian Hospital and Medical Center',
        address: '2205 Civic Drive, Filinvest City, Alabang, Muntinlupa City',
        city: 'Muntinlupa City',
        contact_number: '+632-8-771-9000', 
        email: 'info@asianhospital.com',
      }
    ];

    for (const hospital of hospitals) {
      await pool.execute(
        `INSERT INTO hospitals (
          name, address, city, contact_number, email, 
          is_accredited, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 1, 1, NOW(), NOW())`,
        [
          hospital.name,
          hospital.address, 
          hospital.city,
          hospital.contact_number,
          hospital.email
        ]
      );
      
      console.log(`✅ Added: ${hospital.name}`);
    }
    
    // Verify the data
    const [result] = await pool.execute('SELECT COUNT(*) as total FROM hospitals');
    console.log(`📊 Total hospitals in database: ${result[0].total}`);
    
    const [hospitals_list] = await pool.execute('SELECT id, name, city FROM hospitals');
    console.log('\n🏥 Available hospitals:');
    hospitals_list.forEach(h => {
      console.log(`  ${h.id}. ${h.name} - ${h.city}`);
    });
    
    console.log('\n🎉 Hospital seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding hospitals:', error.message);
  } finally {
    await pool.end();
  }
}

seedHospitals();