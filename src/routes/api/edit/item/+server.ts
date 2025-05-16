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

        let item = await db.getItem(idn);
        let sql;

        if (item?.item_id == undefined) {
            throw new Error('id does not exist');
        }



        interface BodyContent {
            external_id: number, // external id
            item_type: string,
            item_cover_overide_url: string | undefined,
            item_banner_overide_url: string | undefined,
            item_name: string | undefined,
            item_date: string | undefined
    
        }

        let bodyContent: BodyContent = await request.json();

        if (bodyContent.external_id != undefined && bodyContent.external_id != item?.external_id) {
            sql = await db.query('UPDATE item SET external_id = ? WHERE item_id = ?', [bodyContent.external_id, idn]);

            if (sql?.errno) {
                throw new Error('Unable to update external_id');
            }
        }

        if (bodyContent.item_type != undefined && bodyContent.item_type != item?.item_type) {
            sql = await db.query('UPDATE item SET item_type = ? WHERE item_id = ?', [bodyContent.item_type, idn]);

            if (sql?.errno) {
                throw new Error('Unable to update item_type');
            }
        }

        if (bodyContent.item_cover_overide_url != undefined && bodyContent.item_cover_overide_url != item?.item_cover_overide_url) {
            sql = await db.query('UPDATE item SET item_cover_overide_url = ? WHERE item_id = ?', [bodyContent.item_cover_overide_url, idn]);

            if (sql?.errno) {
                throw new Error('Unable to update item_cover_overide_url');
            }
        }

        if (bodyContent.item_banner_overide_url != undefined && bodyContent.item_banner_overide_url != item?.item_banner_overide_url) {
            sql = await db.query('UPDATE item SET item_banner_overide_url = ? WHERE item_id = ?', [bodyContent.item_banner_overide_url, idn]);

            if (sql?.errno) {
                throw new Error('Unable to update item_banner_overide_url');
            }
        }
 
        if (bodyContent.item_name != undefined && bodyContent.item_name != item?.item_name) {
            sql = await db.query('UPDATE item SET item_name = ? WHERE item_id = ?', [bodyContent.item_name, idn]);

            if (sql?.errno) {
                throw new Error('Unable to update item_name');
            }
        }

        if (bodyContent.item_date != undefined && bodyContent.item_date != item?.item_date) {
            sql = await db.query('UPDATE item SET item_date = ? WHERE item_id = ?', [bodyContent.item_date, idn]);

            if (sql?.errno) {
                throw new Error('Unable to update item_date');
            }
        }


    } catch (e) {
        const err = e as Error;
        console.error(err);
        error(500, 'unable to find/edit item');
    }

    return json({ message : "OK" }, {status: 200});
};