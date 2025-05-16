/**
 * A module for reading env variables
 */

import dotenv from 'dotenv';

dotenv.config();


if (!process.env.DB_HOST || 
    !process.env.DB_USER || 
    !process.env.DB_PASSWORD || 
    !process.env.DB_NAME || 
    !process.env.DB_CHARSET || 
    !process.env.DB_PORT || 
    !process.env.REVIEW_DOC_API_KEY || 
    !process.env.REVIEW_DOC_BACKUP_DIR || 
    !process.env.REVIEW_DOC_IGDB_CLIENT_ID || 
    !process.env.REVIEW_DOC_IGDB_SECRET_ID || 
    !process.env.REVIEW_DOC_TMDB_READ_ACCESS_TOKEN) {
    console.error('Error: One or more required environment variables are missing.');
    process.exit(1);
}



/**
 * returns a database hostname
 * @returns string
 */
function dbHost(): string {

    return String(process.env.DB_HOST);
}

/**
 * returns a database username
 * @returns string
 */
function dbUser(): string {
    return String(process.env.DB_USER);
}

/**
 * returns a databse password
 * @returns string
 */
function dbPassword(): string {
    return String(process.env.DB_PASSWORD);
}

/**
 * returns a database name
 * @returns string
 */
function dbName(): string {
    return String(process.env.DB_NAME);
}

/**
 * returns the character set of a database
 * @returns string
 */
function dbCharset(): string {
    return String(process.env.DB_CHARSET);
}

/**
 * returns the port used by a database
 * @returns number
 */
function dbPort(): number {
    return Number(process.env.DB_PORT);
}

/**
 * returns the API key used by this system
 * @returns string
 */
function rdAPIKey(): string {
    return String(process.env.REVIEW_DOC_API_KEY);
}

/**
 * returns the directory where sql dumps will be stored
 * @returns string
 */
function rdBackupDir(): string {
    return String(process.env.REVIEW_DOC_BACKUP_DIR);
}

/**
 * returns the client id used to connect to IGDB
 * @returns string
 */
function rdIGDBClient(): string {
    return String(process.env.REVIEW_DOC_IGDB_CLIENT_ID);
}

/**
 * returns the secret id used to connect to IGDB
 * @returns string
 */
function rdIGDBSecret(): string {
    return String(process.env.REVIEW_DOC_IGDB_SECRET_ID);
}

/**
 * returns the read access token used by TMDB
 * @returns string
 */
function rdTMDBReadAccessToken(): string {
    return String(process.env.REVIEW_DOC_TMDB_READ_ACCESS_TOKEN);
}


export default {
    dbHost,
    dbUser,
    dbPassword,
    dbName,
    dbCharset,
    dbPort,
    rdAPIKey,
    rdBackupDir,
    rdIGDBClient,
    rdIGDBSecret,
    rdTMDBReadAccessToken
}