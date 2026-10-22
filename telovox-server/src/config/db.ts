/**
 * ============================================================================
 * Project: Telovox - Open Source AI Telephony & Calling Automation Platform
 * Author: Sohail MN (Aka Fingvo) - Full Stack Engineer
 * Copyright: (c) 2026 Fingvo. All rights reserved.
 * License: MIT License
 * ============================================================================
 * Description: Production MySQL connection pool configuration using mysql2/promise.
 * ============================================================================
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool optimized for concurrent telephony queries
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'telovox_db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 25,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

/**
 * Verifies active database connection during startup.
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    console.log('[Telovox DB] Successfully connected to MySQL database.');
    connection.release();
    return true;
  } catch (err: unknown) {
    console.error('[Telovox DB] Warning: MySQL connection failed. Ensure MySQL is running and telovox_db exists:', err);
    return false;
  }
}
