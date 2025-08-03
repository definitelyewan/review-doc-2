import type { PageLoad } from './$types';
import type { itemStructure, itemReview, listStructure } from '$lib/types';
import { json, error, redirect } from '@sveltejs/kit';
import db from '$lib/server/db';

export const load: PageLoad = async ({ params }) => {

    const id: number = parseInt(params.id);

    if (Number.isNaN(id)) {
        error(400, "Not a valid ID");
    }

    try {

        // get list info 

        const list = await db.getList(id);

        if (list?.list_id == undefined) {
            redirect(307, "/list");
        }

        let listData: listStructure = {
            id : id,
            name : list.list_name,
            desc : list.list_desc,
            items : []
        };

        const listMembers: number [] = await db.getListMembers(id);
        let numerator = 0;


        for (let listMember of listMembers) {
            const member = await db.getItem(listMember);

            const item: itemStructure = {
                id : member.item_id,
                name : member.item_name,
                cover : member.item_cover_overide_url,
                banner : member.item_banner_overide_url,
                release : member.item_date,
                type : member.item_type
            }

            if (item.type == 'tv') {
                numerator = numerator + await db.getItemNameWeightedAvgScore(item.id);
            } else {
                numerator = numerator + await db.getItemAvgScore(item.id);
            }

            listData.items?.push(item);   
        }

        // get an average score
        const denominator: number = listData.items?.length ?? 1;
        const avg = numerator / denominator;

        return {list : listData, avg : avg};

    }catch (e) {
        const err = e as Error;
        console.error(err);
        error(500, "Unable to fetch list");
    }
};