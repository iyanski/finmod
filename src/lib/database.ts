import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database;

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'finmod.db');
    db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Create tables if they don't exist
    initializeTables();
  }
  
  return db;
}

function initializeTables() {
  const db = getDatabase();
  
  // Business Descriptions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS business_descriptions (
      id TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      industry TEXT NOT NULL,
      business_model TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Financial Inputs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS financial_inputs (
      id TEXT PRIMARY KEY,
      business_description_id TEXT NOT NULL,
      revenue_model TEXT NOT NULL,
      revenue_growth TEXT NOT NULL,
      pricing_strategy TEXT NOT NULL,
      cost_structure TEXT NOT NULL,
      operating_expenses TEXT NOT NULL,
      margin_targets TEXT NOT NULL,
      working_capital TEXT NOT NULL,
      capex TEXT NOT NULL,
      debt_structure TEXT NOT NULL,
      tax_rate REAL NOT NULL,
      discount_rate REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (business_description_id) REFERENCES business_descriptions(id)
    )
  `);
  
  // Financial Models table
  db.exec(`
    CREATE TABLE IF NOT EXISTS financial_models (
      id TEXT PRIMARY KEY,
      financial_inputs_id TEXT NOT NULL,
      income_statement TEXT NOT NULL,
      balance_sheet TEXT NOT NULL,
      cash_flow_statement TEXT NOT NULL,
      schedules TEXT NOT NULL,
      scenarios TEXT NOT NULL,
      audit_checks TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (financial_inputs_id) REFERENCES financial_inputs(id)
    )
  `);
  
  // Conversation Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS conversation_sessions (
      id TEXT PRIMARY KEY,
      business_description TEXT NOT NULL,
      questions TEXT NOT NULL,
      answers TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'in_progress',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Users table (for future authentication)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export function closeDatabase() {
  if (db) {
    db.close();
  }
}
