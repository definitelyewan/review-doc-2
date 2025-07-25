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

        let item = await db.getReview(idn);
        let sql;

        if (item?.item_id == undefined) {
            throw new Error('id does not exist');
        }


        interface BodyContent {
            item_id: number | undefined,
            review_score: number | undefined,
            review_md: string | undefined,
            review_sub_name: string | undefined,
            review_date: string | undefined,
            review_rewatch: boolean | undefined

    
        }

        let bodyContent: BodyContent = await request.json();

        if (bodyContent.item_id != undefined && bodyContent.item_id != item?.item_id) {
            sql = await db.query('UPDATE review SET item_id = ? WHERE review_id = ?', [bodyContent.item_id, idn]);

            if (sql?.errno) {
                throw new Error('Unable to update item_id');
            }
        }

        if (bodyContent.review_score != undefined && bodyContent.review_score != item?.review_score) {
            sql = await db.query('UPDATE review SET review_score = ? WHERE review_id = ?', [bodyContent.review_score, idn]);

            if (sql?.errno) {
                throw new Error('Unable to update review_score');
            }
        }

        if (bodyContent.review_md != undefined && bodyContent.review_md != item?.review_md) {
            sql = await db.query('UPDATE review SET review_md = ? WHERE review_id = ?', [bodyContent.review_md, idn]);

            if (sql?.errno) {
                throw new Error('Unable to update review_md');
            }
        }

        if (bodyContent.review_sub_name != undefined && bodyContent.review_sub_name != item?.review_sub_name) {
            sql = await db.query('UPDATE review SET review_sub_name = ? WHERE review_id = ?', [bodyContent.review_sub_name, idn]);

            if (sql?.errno) {
                throw new Error('Unable to update review_sub_name');
            }
        }

        if (bodyContent.review_date != undefined && bodyContent.review_date != item?.review_date) {
            sql = await db.query('UPDATE review SET review_date = ? WHERE review_id = ?', [bodyContent.review_date, idn]);

            if (sql?.errno) {
                throw new Error('Unable to update review_date');
            }
        }

        if (bodyContent.review_rewatch != undefined && bodyContent.review_rewatch != item?.review_rewatch) {
            sql = await db.query('UPDATE review SET review_rewatch = ? WHERE review_id = ?', [bodyContent.review_rewatch, idn]);

            if (sql?.errno) {
                throw new Error('Unable to update review_rewatch');
            }
        }

    } catch (e) {
        const err = e as Error;
        console.error(err);
        error(500, 'unable to find/edit item');
    }

    return json({ message : "OK" }, {status: 200});
};