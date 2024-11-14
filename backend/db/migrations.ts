import sql from './connection.ts';
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

// Create migrations table if it doesn't exist
async function createMigrationsTable() {
    await sql`
        CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `;
}

async function getExecutedMigrations() {
    return await sql`SELECT name FROM migrations ORDER BY id`;
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
                    INSERT INTO migrations (name)
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