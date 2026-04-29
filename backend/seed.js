const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'rsquare_journal',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

const seedData = async () => {
    try {
        console.log("Seeding database...");
        
        // Ensure initial data exists
        await pool.query(`
            INSERT INTO authors (name, email, affiliation) 
            VALUES 
            ('Dr. Emily Carter', 'emily@rsquare.com', 'Department of Oncology, R Square Hospitals'),
            ('Dr. James Wilson', 'james@rsquare.com', 'Department of Neurology, R Square Hospitals'),
            ('Dr. Sophia Lee', 'sophia@rsquare.com', 'Cardiology Research Center, New Delhi')
            ON CONFLICT (email) DO NOTHING
        `);

        await pool.query(`
            INSERT INTO categories (name) 
            VALUES ('Clinical Trials'), ('Case Studies'), ('Neurological Research'), ('Cardiovascular Medicine')
            ON CONFLICT (name) DO NOTHING
        `);

        // Get IDs
        const authors = await pool.query('SELECT id FROM authors');
        const categories = await pool.query('SELECT id FROM categories');

        const articles = [
            [
                'Impact of mRNA Vaccines on Post-Operative Recovery in Cancer Patients',
                'This randomized clinical trial investigates whether pre-operative administration of specific mRNA vaccines improves long-term outcomes...',
                authors.rows[0].id,
                categories.rows[0].id,
                '10.1001/rsquare.2026.001'
            ],
            [
                'Neural Plasticity and Cognitive Recovery after Ischemic Stroke: A Longitudinal Study',
                'Stroke remains a leading cause of long-term disability. This study monitors 200 patients over 2 years to map neural reorganization...',
                authors.rows[1].id,
                categories.rows[2].id,
                '10.1001/rsquare.2026.002'
            ],
            [
                'Association between High-Sensitivity C-Reactive Protein and Early Coronary Artery Disease',
                'We analyzed biomarkers in 1,000 asymptomatic individuals to determine the predictive value of hs-CRP in subclinical atherosclerosis...',
                authors.rows[2].id,
                categories.rows[3].id,
                '10.1001/rsquare.2026.003'
            ],
            [
                'Robotic-Assisted Minimally Invasive Surgery in Pediatric Urology: Outcomes and Challenges',
                'A retrospective analysis of 50 pediatric cases where robotic systems were employed for complex urological reconstructions...',
                authors.rows[0].id,
                categories.rows[1].id,
                '10.1001/rsquare.2026.004'
            ]
        ];

        for (const article of articles) {
            await pool.query(
                'INSERT INTO articles (title, abstract, author_id, category_id, doi) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (doi) DO NOTHING',
                article
            );
        }

        console.log("Seeding complete.");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
};

seedData();
