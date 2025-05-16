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

        let item = await db.getAward(idn);
        let sql;

        if (item?.item_id == undefined) {
            throw new Error('id does not exist');
        }


        interface BodyContent {
            item_id: number | undefined,
            award_name: string | undefined,
            award_year: number | undefined,
            award_granted: boolean | undefined

    
        }

        let bodyContent: BodyContent = await request.json();

        if (bodyContent.item_id != undefined && bodyContent.item_id != item?.item_id) {
            sql = await db.query('UPDATE award SET item_id = ? WHERE award_id = ?', [bodyContent.item_id, idn]);

            if (sql?.errno) {
                throw new Error('Unable to update item_id');
            }
        }

        if (bodyContent.award_name != undefined && bodyContent.award_name != item?.award_name) {
            sql = await db.query('UPDATE award SET award_name = ? WHERE award_id = ?', [bodyContent.award_name, idn]);

            if (sql?.errno) {
                throw new Error('Unable to update award_name');
            }
        }

        if (bodyContent.award_year != undefined && bodyContent.award_year != item?.award_year) {
            sql = await db.query('UPDATE award SET award_year = ? WHERE award_id = ?', [bodyContent.award_year, idn]);

            if (sql?.errno) {
                throw new Error('Unable to update award_year');
            }
        }

        if (bodyContent.award_granted != undefined && bodyContent.award_granted != item?.award_granted) {
            sql = await db.query('UPDATE award SET award_granted = ? WHERE award_id = ?', [bodyContent.award_granted, idn]);

            if (sql?.errno) {
                throw new Error('Unable to update award_granted');
            }
        }

    } catch (e) {
        const err = e as Error;
        console.error(err);
        error(500, 'unable to find/edit item');
    }

    return json({ message : "OK" }, {status: 200});
};