import { json } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import env from '$lib/server/env';
import db from '$lib/server/db';

export async function POST ({ request }) {

    /*
     * validate the request
     */

    if (request.headers.get('Authorization') == undefined) {
        error(400, 'Authorization not provided');
    }

    if (env.rdAPIKey() !== request.headers.get('Authorization')) {
        error(400, 'Unauthorized request');
    }

    interface BodyContent {
        list_name: string,
        list_desc: string | undefined,
        list_item: number [] | undefined
    }

    let bodyContent: BodyContent = await request.json();

    if (!bodyContent.list_name) {
        error(400, 'Invalid request body: Missing required fields');
    }

    try {
        const latest = await db.getMaxTableID("list");

        if (latest == -1) {
            throw new Error("failed to calculate new ID");
        }
        let newId = latest + 1
        const insert = await db.insertList(newId, bodyContent.list_name, bodyContent?.list_desc);

        if (!insert.success) {
            throw new Error("Failed insert list");
        }


        if (bodyContent?.list_item) {

            for (let entry of bodyContent.list_item) {
                const itemInsert = await db.insertListItem(newId, entry);
                
                if (!itemInsert.success) {
                    console.error("Did Not add ID: " + entry + " to list");
                    continue;
                }
            } 

        }

    } catch (e) {
        const err = e as Error;
        console.error(err);
        error(500, "Error adding content");
    }

    return json({ message : "OK" }, {status: 200});
}