import type { PageLoad, Actions } from './$types';
import { json, error, redirect } from '@sveltejs/kit';
import db from '$lib/server/db';
import type { itemStructure, listStructure } from '$lib/types';


export const load: PageLoad = async ({ params }) => {

    try {

        const lists = await db.getAllLists();

        let blocks: listStructure[] = [];

        for (const list of lists) {
            const itemsSql = await db.query('SELECT item.* FROM list_item INNER JOIN item WHERE item.item_id = list_item.item_id AND list_item.list_id = ?', [list.list_id]);

            const items: itemStructure[] = itemsSql.map((row: any) => ({
                id: row.item_id,
                name: row.item_name,
                cover: row.item_cover_overide_url,
                banner: row.item_banner_overide_url,
                release: row.item_date,
                type: row.item_type
            }));

            blocks.push({
                id: list.list_id,
                name: list.list_name,
                desc: list.list_desc,
                items: items
            });
        }

        return { blocks };
    } catch (e) {
        const err = e as Error;
        console.error(err);
        error(500, 'unable to return one or more lists');
    }
};