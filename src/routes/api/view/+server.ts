import { json, error } from '@sveltejs/kit';
import security from '$lib/server/security';
import db from '$lib/server/db';


export async function GET ({ request, url }) {
    /*
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

    const term = url.searchParams.get('term');
    const type = url.searchParams.get('type');


    try {

        let statments: string [] = [];
        let results: object [] = [];

        if (type == 'award') {
            statments.push('WITH variable AS (SELECT ? AS search_term) SELECT award.* FROM award INNER JOIN item ON award.item_id = item.item_id WHERE item.item_name = (SELECT search_term FROM variable) OR award.award_name = (SELECT search_term FROM variable)');
        } else if (type == 'item') {
            statments.push('SELECT * FROM item WHERE item_name = ?');
        } else if (type == 'review') {
            statments.push('SELECT review.* FROM review INNER JOIN item WHERE review.item_id = item.item_id AND item.item_name = ?');
        } else if (type == 'list') {
            statments.push('SELECT * from list WHERE list_name = ?');
            statments.push('SELECT item.* FROM list INNER JOIN list_item INNER JOIN item WHERE list_name = ? AND list.list_id = list_item.list_id AND list_item.item_id = item.item_id');
        } else if (type == 'link') {
            statments.push('SELECT item_id_2.* FROM link INNER JOIN item item_id_1 ON link.item_id_1 = item_id_1.item_id INNER JOIN item item_id_2 ON link.item_id_2 = item_id_2.item_id WHERE item_id_1.item_name = ?');
            statments.push('SELECT link.* FROM link INNER JOIN item ON link.item_id_1 = item.item_id WHERE item.item_name = ?');
        }else {
            throw new Error("type is for a table that does not exist");
        }

        for (let statment of statments) {
            const search = await db.query(statment,[term]);

            // FAIL NO MATTER WHAT ON A SINGLE ERROR
            if (search?.errno) {
                throw new Error("failed to get anything");
            }

            results.push(search);
        }

        return json(results);

    } catch (e) {
        const err = e as Error;
        console.error(err);
        error(500, 'unable to find viewable items');
    }

};
