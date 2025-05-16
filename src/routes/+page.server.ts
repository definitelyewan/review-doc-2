import type { PageLoad} from './$types';
import { json, error, redirect } from '@sveltejs/kit';
import db from '$lib/server/db';
import type { displayReview, itemReview, itemStructure } from '$lib/types';


export const load: PageLoad = async ({ params }) => {

    try {
        let blocks: displayReview [] = [];
        const allReviews = await db.getAllReviews();

        for (let review of allReviews) {
            const item = await db.getItem(review.item_id);

            const formattedDate = new Date(review.review_date).toISOString().split('T')[0];
            

            const reviewData: itemReview = {
                score : review.review_score,
                md : review.review_md,
                sub : review.review_sub_name,
                date : formattedDate
            };

            const itemData: itemStructure = {
                id : item.item_id,
                name : item.item_name,
                cover : item.item_cover_overide_url,
                banner : item.item_banner_overide_url,
                release : item.item_date,
                type : item.item_type
            }

            blocks.push({item: itemData, review: reviewData});
        }

        return {blocks};

    } catch (e) {
        const err = e as Error;
        console.error(err);
        error(500, 'unable to return one or more items');
    }
};