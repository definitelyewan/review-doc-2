import { json, error } from '@sveltejs/kit';
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
        item_id: number, //id of item
        award_granted: boolean // nominee or winner
        award_name: string // award name
        award_year: number | undefined // year


    }

    let bodyContent: BodyContent = await request.json();


    if (bodyContent.item_id == undefined || bodyContent.award_granted == undefined ||bodyContent.award_name == undefined) {
        error(400, "One or more required fields missing");
    }

    try {
        // calculate id
        const latest = await db.query('SELECT MAX(award_id) AS latest_id FROM award');
        let newId: number = 1;

        if (!(latest[0].latest_id == null)) {
            newId = latest[0].latest_id + 1;
        }

        if (bodyContent.award_year == undefined) {
            bodyContent.award_year = new Date().getFullYear();
        }

        const insert = await db.insertAward(newId, bodyContent.item_id, bodyContent.award_granted, bodyContent.award_name, bodyContent?.award_year);

        if (!insert.success) {
            throw new Error(insert.error);
        }

    } catch (e) {
        const err = e as Error;
        console.error(err);
        error(500, "failed to insert award");
    }

    return json({ message : "OK" }, {status: 200});
};
