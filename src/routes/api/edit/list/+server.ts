import { json, error } from '@sveltejs/kit';
import env from '$lib/server/env';
import db from '$lib/server/db';


export async function POST ({ request, url }) {
    /*
    * validate the request
    */

    if (request.headers.get('Authorization') == undefined) {
        error(400, 'Authorization not provided');
    }

    if (env.rdAPIKey() !== request.headers.get('Authorization')) {
        error(400, 'Unauthorized request');
    }

    const id = url.searchParams.get('id');
    
    try {

        const idn = parseInt(String(id));

        let list = await db.getList(idn);
        let sql;

        if (list?.list_id == undefined) {
            throw new Error('id does not exist');
        }

        interface BodyContent {
            list_name: string | undefined,
            list_desc: string | undefined,
            list_item: number [] | undefined
    
        }

        let bodyContent: BodyContent = await request.json();

        if (bodyContent.list_name != undefined) {
            sql = await db.query('UPDATE list SET list_name = ? WHERE list_id = ?', [bodyContent.list_name, idn]);

            if (sql?.errno) {
                throw new Error('Unable to update list name');
            }
        }

        if (bodyContent.list_desc != undefined) {
            sql = await db.query('UPDATE list SET list_desc = ? WHERE list_id = ?', [bodyContent.list_desc, idn]);

            if (sql?.errno) {
                throw new Error('Unable to update list desc');
            }
        }

        // drop all items in the list and replace it with the new one

        const oldListMembers: number [] = await db.getListMembers(idn);

        for (let member of oldListMembers) {
            const dropResult = await db.query('DELETE FROM list_item WHERE list_id = ? AND item_id = ?',[idn, member]);
            
            if (dropResult?.errno) {
                throw new Error('Unable to remove id = ' + member + ' from list = ' + idn);
            }
        }
        if (bodyContent.list_item != undefined) {
            for (let member of bodyContent.list_item) {
                const addResult = await db.query('INSERT INTO list_item(list_id, item_id) VALUES(?,?)',[idn, member]);
                
                if (addResult?.errno) {
                    throw new Error('Unable to add id = ' + member + ' to list = ' + idn);
                }
            }
        }


    } catch (e) {
        const err = e as Error;
        console.error(err);
        error(500, "Error Editing content");
    }

    return json({ message : "OK" }, {status: 200});
};