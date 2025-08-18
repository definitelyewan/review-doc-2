import { json } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import security from '$lib/server/security.js';
import env from '$lib/server/env';
import db from '$lib/server/db';
import fs from 'fs';


function findClosestDate(folderPath: string): string | null {
    const currentDate = new Date();

    // Read all files in the folder
    const files = fs.readdirSync(folderPath);

    // Filter files matching the yyyy-mm-dd format
    const dateFiles = files.filter(file => /^\d{4}-\d{2}-\d{2}$/.test(file));

    if (dateFiles.length === 0) {
        return null; // No valid date files found
    }

    // Parse dates and find the closest one
    let closestFile = null;
    let closestDiff = Infinity;

    for (const file of dateFiles) {
        const fileDate = new Date(file);
        const diff = Math.abs(currentDate.getTime() - fileDate.getTime());

        if (diff < closestDiff) {
            closestDiff = diff;
            closestFile = file;
        }
    }

    return closestFile;
}

/**
 * POST request for rebuilding and backing up the internal database
 */
export async function POST ({ request, url }) {
    
    const type = url.searchParams.get('type');
    const types: String[] = ['rebuild', 'backup'];

    /**
     * validate the request
     */

    try {
        let valid = security.validateCredential(String(request.headers.get('Authorization')));
        
        if (!valid) {
            throw new Error("Token not valid");
        }

    } catch (e) {
        const err = e as Error;
        console.error(err);
        error(400, 'Not authenticated or token timed out');
    }


    if (!types.includes(String(type))) {
        error(400, 'Invalid "type" query parameter');
    }


    /**
     * serve the request
     */
    try {

        if (type == types[0]) { // rebuild
            const mkSchema = await db.schema();

            if (!mkSchema.success) {
                throw new Error(`Schema generation failed: ${mkSchema.error}`);
            }

            const fileName = findClosestDate(env.rdBackupDir());
            if (fileName == null) {
                return json({ message: "No backups" }, {status: 200});
            }


            const buildDb = await db.fileToDatabase(env.rdBackupDir() + '/' + fileName);


            if (!buildDb.success) {
                throw new Error(`Failed to rebuild database`);
            }


        } else if (type == types[1]) { // backup

            const mkBackup = await db.toJsonFile();

            if (!mkBackup.success) {
                throw new Error(`json backup generation failed: ${mkBackup.error}`);
            }


        }

    } catch (e) {
        const err = e as Error
        console.error(err);
        error(500, err);
    }



    return json({ message: "OK" }, {status: 200});
}