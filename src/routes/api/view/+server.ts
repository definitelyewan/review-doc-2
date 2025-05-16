import { json, error } from '@sveltejs/kit';
import env from '$lib/server/env';
import db from '$lib/server/db';


export async function GET ({ request, url }) {
    /*
    * validate the request
    */

    if (request.headers.get('Authorization') == undefined) {
        error(400, 'Authorization not provided');
    }

    if (env.rdAPIKey() !== request.headers.get('Authorization')) {
        error(400, 'Unauthorized request');
    }

    const term = url.searchParams.get('term');
    const type = url.searchParams.get('type');


    try {

        let sql: string = '';

        if (type == 'award') {
            sql = 'SELECT award.* FROM award INNER JOIN item WHERE award.item_id = item.item_id AND item.item_name = ?';
        } else if (type == 'item') {
            sql = 'SELECT * FROM item WHERE item_name = ?';
        } else if (type == 'review') {
            sql = 'SELECT review.* FROM review INNER JOIN item WHERE review.item_id = item.item_id AND item.item_name = ?';
        } else {
            throw new Error("type is for a table that does not exist");
        }


        const search = await db.query(sql,[term]);

        if (search?.errno) {
            throw new Error("failed to get anything");
        }

        return json(search);

    } catch (e) {
        const err = e as Error;
        console.error(err);
        error(500, 'unable to find award for item');
    }

};