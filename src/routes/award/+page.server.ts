import type { PageLoad, Actions } from './$types';
import { json, error, redirect } from '@sveltejs/kit';
import db from '$lib/server/db';
import type { groupedAwards } from '$lib/types';


export const load: PageLoad = async ({ params }) => {


    try {

        const uniqueYears: number [] = await db.getUniqueAwardYears();
        let blocks: groupedAwards [] = [];

        for (let year of uniqueYears) {
            const awards = await db.getAwardsByYear(year);

            
            let grouped: Record<string, any[]> = {};

            for (let award of awards) {
                if (!grouped[award.award_name]) {
                    grouped[award.award_name] = [];
                }

                const itemInfo = await db.getItem(award.item_id);

                delete award.item_id;
                award.item = itemInfo;

                grouped[award.award_name].push(award);
            }

            let block: groupedAwards = { year: year, awards: grouped };
            blocks.push(block);
        }

        blocks.sort((a, b) => b.year - a.year);
        return {blocks};

    } catch (e) {
        const err = e as Error;
        console.error(err);
        error(500, 'Failed to get awards');
    }
};