import type { PageLoad } from './$types';
import type { itemStructure, itemReview } from '$lib/types';
import { json, error, redirect } from '@sveltejs/kit';
import db from '$lib/server/db';

export const load: PageLoad = async ({ params }) => {

    const id: number = parseInt(params.id);

    if (Number.isNaN(id)) {
        error(400, "Not a valid ID");
    }

    const item = await db.getItem(id);

    // no matching id in db
    if (item.item_id == undefined) {
        redirect(307, "/item");
    }


    // build something based on type
    let itemData: itemStructure = {
        id : id,
        name : "",
        cover : "",
        banner : "",
        release : "",
        type : ""
    };


    try {
        
        const item = await db.getItem(id);

        itemData.banner = item.item_banner_overide_url;
        itemData.cover = item.item_cover_overide_url;
        itemData.name = item.item_name;
        itemData.release = item.item_date;
        itemData.type = item.item_type;
       
    } catch (e) {
        const err = e as Error;
        console.error(err);
        error(500, "Unable to fetch external resources");
    }

    

    // get all review content
    let reviewDatas: itemReview [] = [];

    try {

        const reviews = await db.getReviewsByItem(id);

        if (reviews.length != 0) {
            for (let review of reviews) {
                const dateObj = new Date(review?.review_date);
                const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    
                const md = (review?.review_md == null) ? undefined : review.review_md;
    
                let tmp: itemReview = {
                    score : review?.review_score,
                    md : md,
                    sub : review.review_sub_name,
                    date : formattedDate,
                    rewatch : review.review_rewatch
    
                };
    
                reviewDatas.push(tmp);
            }
    
            reviewDatas.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }




    } catch (e) {
        const err = e as Error;
        console.error(err);
        error(500, "Unable to fetch reviews");
    }

    // get the average score
    let avgScore = 0.0;

    if (item.item_type == 'tv') {
        avgScore = await db.getItemNameWeightedAvgScore(id);
    } else {
        avgScore = await db.getItemAvgScore(id);
    }

    return {itemData, reviewDatas, avgScore};
};