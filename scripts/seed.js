
const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        let credential;
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            credential = admin.credential.cert(serviceAccount);
            console.log('✅ Using service account from environment variable');
        } else {
            console.log('⚠️ No FIREBASE_SERVICE_ACCOUNT found, trying application default...');
            credential = admin.credential.applicationDefault();
        }

        admin.initializeApp({
            credential,
            databaseURL: "https://incident-tracking-system-default-rtdb.firebaseio.com" // Hardcoded or from env
        });
        console.log('✅ Firebase Admin initialized');
    } catch (error) {
        console.error('❌ Initialization error:', error);
        process.exit(1);
    }
}

const db = admin.database();

const ZAMBIA_LOCATIONS = [
    { province: 'Lusaka', district: 'Lusaka', lat: -15.4167, lng: 28.2833 },
    { province: 'Copperbelt', district: 'Ndola', lat: -12.9667, lng: 28.6333 },
    { province: 'Copperbelt', district: 'Kitwe', lat: -12.8000, lng: 28.2000 },
    { province: 'Southern', district: 'Livingstone', lat: -17.8500, lng: 25.8167 },
    { province: 'Central', district: 'Kabwe', lat: -14.4333, lng: 28.4500 },
    { province: 'Eastern', district: 'Chipata', lat: -13.6333, lng: 32.6500 },
    { province: 'Northern', district: 'Kasama', lat: -10.2167, lng: 31.1833 },
    { province: 'Western', district: 'Mongu', lat: -15.2833, lng: 23.1500 },
    { province: 'Luapula', district: 'Mansa', lat: -11.1833, lng: 28.8833 },
    { province: 'North-Western', district: 'Solwezi', lat: -12.1833, lng: 26.4000 }
];

const CATEGORIES = ['Health', 'Infrastructure', 'Environment', 'Social', 'Election', 'Voter Safety', 'Political Violence', 'Logistics Disruption', 'Staff Support', 'Public Disturbance'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES = ['Reported', 'Verified', 'Team Dispatched', 'In Progress', 'Resolved', 'Rejected'];

async function seed() {
    console.log('🌱 Starting seed...');
    const incidentsRef = db.ref('incidents');

    try {
        for (let i = 0; i < 50; i++) {
            const location = ZAMBIA_LOCATIONS[Math.floor(Math.random() * ZAMBIA_LOCATIONS.length)];
            const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
            const priority = PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)];
            const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];

            const lat = location.lat + (Math.random() - 0.5) * 0.1;
            const lng = location.lng + (Math.random() - 0.5) * 0.1;

            const incident = {
                title: `${category} Incident in ${location.district}`,
                description: `Reported ${category.toLowerCase()} issue requiring attention in ${location.district}, ${location.province} province.`,
                category,
                priority,
                status,
                location: {
                    address: `${location.district}, ${location.province}`,
                    province: location.province,
                    district: location.district,
                    coordinates: {
                        latitude: lat,
                        longitude: lng
                    }
                },
                dateReported: Date.now() - Math.floor(Math.random() * 1000000000),
                reporter: {
                    name: 'System Seeder',
                    contact: 'N/A',
                    isAnonymous: false
                }
            };

            await incidentsRef.push(incident);
            process.stdout.write('.');
        }
        console.log('\n✅ Successfully seeded 50 incidents!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
