import type { PageLoad, Actions } from './$types';
import { json, error, redirect } from '@sveltejs/kit';
import db from '$lib/server/db';
import tmdb from '$lib/server/tmdb';


export const load: PageLoad = async ({ params }) => {


    try {

        const items = await db.getAllItems();
        let blocks: {} [] = [];

        for (const item of items) {

            blocks.push({url: item.item_cover_overide_url, id: item.item_id, name: item.item_name, banner: item.item_banner_overide_url, date: item.item_date});

            
        }
 

        return {blocks};
    

    } catch (e) {
        const err = e as Error;
        console.error(err);
        error(500, 'unable to return one or more items');
    }
};

