import { json } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
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

    interface reviewContent {
        item_id: number,
        review_score: number | undefined,
        review_md: string | undefined,
        review_sub_name: string,
        review_date: string | undefined,
        review_rewatch : boolean | false
    }
    
    const reviewContent: reviewContent = await request.json();

    if (!reviewContent.item_id || reviewContent.review_sub_name == undefined) {
        error(400, 'Invalid request body: Missing required fields');
    }

    try {

        // calculate id
        const latest = await db.query('SELECT MAX(review_id) AS latest_id FROM review');
        let newId: number = 1;

        if (!(latest[0].latest_id == null)) {
            newId = latest[0].latest_id + 1;
        }

        
        // check if date is correct
        if (reviewContent.review_date) {
            
            const dateChallange = /^\d{4}-\d{2}-\d{2}$/;
            
            if (!dateChallange.test(reviewContent.review_date)) {
                throw new Error("Invalid date format, not yyyy-mm-dd")
            }
        } else {
            reviewContent.review_date = new Date().toISOString().split('T')[0];
        }

        const insert = await db.insertReview(newId, 
                                            reviewContent.item_id, 
                                            reviewContent.review_sub_name, 
                                            reviewContent.review_score, 
                                            reviewContent.review_md, 
                                            reviewContent.review_date, 
                                            reviewContent.review_rewatch);

        if (!insert.success) {
            throw new Error(insert?.error);
        }

    } catch (e) {
        const err = e as Error;
        console.error(err);
        error(500, "Error adding content");

    }

    return json({ message : "OK" }, {status: 200});
}