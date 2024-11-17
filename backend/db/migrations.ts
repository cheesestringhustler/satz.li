import sql from './connection.ts';

// Create migrations table if it doesn't exist
async function createMigrationsTable() {
    await sql.unsafe(`
        CREATE SCHEMA IF NOT EXISTS app;
    `);

    await sql.unsafe(`
        GRANT ALL PRIVILEGES ON SCHEMA app TO CURRENT_USER;
        GRANT USAGE ON SCHEMA app TO CURRENT_USER;
    `);
    
    await sql.unsafe(`
        CREATE TABLE IF NOT EXISTS app.migrations (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await sql.unsafe(`
        SET search_path TO app, public;
    `);
}

async function getExecutedMigrations() {
    return await sql`SELECT name FROM app.migrations ORDER BY id`;
}

export async function runMigrations() {
    await createMigrationsTable();
    
    const executedMigrations = await getExecutedMigrations();
    const executedMigrationNames = executedMigrations.map(m => m.name);

    // List all migration files
    const migrationFiles = await Deno.readDir('./db/migrations');
    
    for await (const file of migrationFiles) {
        if (!file.name.endsWith('.sql')) continue;
        
        // Skip if migration was already executed
        if (executedMigrationNames.includes(file.name)) continue;

        console.log(`Running migration: ${file.name}`);
        
        // Read and execute migration file
        const migration = await Deno.readTextFile(`./db/migrations/${file.name}`);
        
        try {
            await sql.begin(async (sql) => {
                // Execute the migration
                await sql.unsafe(migration);
                
                // Record the migration
                await sql`
                    INSERT INTO app.migrations (name)
                    VALUES (${file.name})
                `;
            });
            
            console.log(`Migration ${file.name} completed successfully`);
        } catch (error) {
            console.error(`Error running migration ${file.name}:`, error);
            throw error;
        }
    }
} 