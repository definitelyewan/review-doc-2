import { json, error } from '@sveltejs/kit';
import security from '$lib/server/security';
import db from '$lib/server/db';

export async function POST ({ request, url }) {
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
        error(400, 'Not authenticated of token timed out');
    }

    try {
        const bodyContents = await request.json();
        const validTables = ['list','item','award','review'];

        // check block headers
        for (let bodyContent of bodyContents) {

            if (bodyContent.data == undefined) {
                throw new Error("One or more malformed data blocks");
            }

            if (bodyContent.id != undefined || bodyContent.type != undefined) {

                const idn = parseInt(bodyContent.id);

                if (Number.isNaN(idn)) {
                    throw new Error("One or more malformed ids")
                }

                if (!validTables.includes(bodyContent.type)) {
                    throw new Error("One or more malformed types");
                }

            } else {
                throw new Error("Missing requried keys id or type for one or more edit");
            }

        }

        // attempt edit updates
        for (let bodyContent of bodyContents) {
            
            const data = bodyContent.data;

            if (bodyContent.type == 'list') {
                await db.editList(bodyContent.id, data?.list_name, data?.list_desc, data?.list_item);
            } else if (bodyContent.type == 'item') {
                await db.editItem(bodyContent.id, data?.external_id, data?.item_cover_overide_url, data?.item_banner_overide_url, data?.item_type, data?.item_name, data?.item_date);
            } else if (bodyContent.type == 'award') {
                await db.editAward(parseInt(bodyContent.id), data?.item_id, data?.award_name, data?.award_year, data?.award_granted);
            } else if (bodyContent.type == 'review') {
                await db.editReview(bodyContent.id, data?.item_id, data?.review_score, data?.review_md, data?.review_sub_name, data?.review_date, data?.review_rewatch);
            }
        }


    } catch (e) {
        const err = e as Error;
        console.error(err);
        error(500, err.message);
    }

    return json({ message: "OK" }, {status: 200});
};