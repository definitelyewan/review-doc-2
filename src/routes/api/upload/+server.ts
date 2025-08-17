import { json, error } from '@sveltejs/kit';
import security from '$lib/server/security';
import db from '$lib/server/db';
import igdb from '$lib/server/igdb';
import tmdb from '$lib/server/tmdb.js';

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

            if (bodyContent.type != undefined) {

                if (!validTables.includes(bodyContent.type)) {
                    throw new Error("One or more malformed types");
                }

            } else {
                throw new Error("Missing requried keys id or type for one or more edit");
            }

        }

        // attempt uploads
        for (let bodyContent of bodyContents) {
            
            const data = bodyContent.data;

            if (bodyContent.type == 'list') {

                if (data?.list_name == undefined) {
                    throw new Error("List missing required columns");
                }
                const newId = await db.getMaxTableID('list') + 1;
                const insertSql = await db.insertList(newId, data?.list_name, data?.list_desc);
                
                if (insertSql.success == false) {
                    throw new Error("Failed to upload list");
                }

                if (data?.list_item != undefined) {
                    for (let item of data?.list_item) {
                        const itemSql = await db.insertListItem(newId, item);

                        if (itemSql.success == false) {
                            throw new Error("Failed to upload one or more list items");
                        }
                    }
                }

            } else if (bodyContent.type == 'item') {
                
                if (data?.external_id == undefined || data?.item_type == undefined) {
                    throw new Error("Item missing required columns");
                }

                if (data?.item_date != undefined) {
                    const regex = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;
                    if (!regex.test(data?.item_date)) {
                        throw new Error("Invalid date string yyyy-mm-dd");
                    }
                }


                if (data?.item_type == 'game') {
                    if (data?.item_cover_overide_url == undefined){
                        const igdbCoverResult = await igdb.getCoverByID(data?.external_id);

                        if (igdbCoverResult.length != 0) {
                            data.item_cover_overide_url = igdbCoverResult[0].url;
                            data.item_cover_overide_url = data.item_cover_overide_url?.replace('t_thumb','t_1080p');
                        } 
                    }

                    if (data?.item_banner_overide_url == undefined){
                        const igdbBannerResult = await igdb.getArtworkByID(data.external_id);
                
                        if (igdbBannerResult.length != 0) {
                            data.item_banner_overide_url = igdbBannerResult[0].url;
                            data.item_banner_overide_url = data.item_banner_overide_url?.replace('t_thumb','t_1080p');
                        }
                    }

                    const igdbResult = await igdb.searchByID(bodyContent.external_id);

                    if (data?.item_name == undefined) {
                        data.item_name = igdbResult.name;
                    }

                    if (data?.item_date == undefined) {
                        data.item_date = new Date(igdbResult.first_release_date * 1000).toISOString().split('T')[0];
                    }
                } else if (data?.item_type == 'movie') {
                    const tmdbResult = await tmdb.searchByID(data.external_id, 'movie');

                    if (data?.item_name == undefined) {
                        data.item_name = tmdbResult.title;
                    }

                    if (data?.item_date == undefined) {
                        data.item_date = tmdbResult.release_date;
                    }

                    if (data?.item_cover_overide_url == undefined) {
                        data.item_cover_overide_url = 'https://image.tmdb.org/t/p/original' + String(tmdbResult.poster_path);
                    }

                    if (data?.item_banner_overide_url == undefined) {
                        data.item_banner_overide_url = 'https://image.tmdb.org/t/p/original' + String(tmdbResult.backdrop_path);
                    }
                } else if (data?.item_type == 'tv') {
                    const tmdbResult = await tmdb.searchByID(data.external_id, 'tv');

                    if (data?.item_name == undefined) {
                        data.item_name = tmdbResult.name;
                        
                    }

                    if (data?.item_date == undefined) {
                        data.item_date = tmdbResult.first_air_date;
                    }

                    if (data?.item_cover_overide_url == undefined) {
                        data.item_cover_overide_url = 'https://image.tmdb.org/t/p/original' + String(tmdbResult.poster_path);
                    }

                    if (data?.item_banner_overide_url == undefined) {
                        data.item_banner_overide_url = 'https://image.tmdb.org/t/p/original' + String(tmdbResult.backdrop_path);
                    }
                } else if (data?.item_type == 'other') {
                    if (data?.item_banner_overide_url == undefined || data?.item_cover_overide_url == undefined || data?.item_date == undefined || data?.item_name == undefined || data?.item_date == undefined) {
                        throw new Error("Missing required fields for type 'other'");
                    }
                } else {
                    throw new Error("Invalid item type");
                }


                const insertSql = await db.insertItem(await db.getMaxTableID('item') + 1, data?.external_id, data?.item_type, data?.item_cover_overide_url, data?.item_banner_overide_url, data?.item_name, data?.item_date);
                
                if (insertSql.success == false) {
                    throw new Error("Failed to upload item");
                }

            } else if (bodyContent.type == 'award') {

                if (data?.item_id == undefined || data?.award_granted == undefined || data?.award_name == undefined) {
                    throw new Error("Award missing required columns");
                } 

                if (data?.award_year != undefined) {
                    if (data?.award_year > 9999 || data?.award_year < 1000) {
                        throw new Error("Invalid award year");
                    }
                } else {
                    data.award_year = new Date().getFullYear();
                }

                const item = await db.getItem(data?.item_id);

                if (item?.item_id == undefined) {
                    throw new Error("Cannot give award to an item that does not exist");
                }

                const insertSql = await db.insertAward(await db.getMaxTableID('award') + 1, data?.item_id, data?.award_granted, data?.award_name, data?.award_year);

                if (insertSql.success == false) {
                    throw new Error("Failed to upload Award");
                }

            } else if (bodyContent.type == 'review') {

                if (data?.item_id == undefined || data?.review_sub_name == undefined) {
                    throw new Error("Missing required columns");
                }

                const item = await db.getItem(data?.item_id);

                if (item?.item_id == undefined) {
                    throw new Error("Cannot give review to an item that does not exist");
                }

                if (data?.review_date != undefined) {
                    const regex = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;
                    if (!regex.test(data?.review_date)) {
                        throw new Error("Invalid date string yyyy-mm-dd");
                    }
                }

                const insertSql = await db.insertReview(await db.getMaxTableID('review'), data?.item_id, data?.review_sub_name, data?.review_score, data?.review_md, data?.review_date, data?.review_rewatch);

                if (insertSql.success == false) {
                    throw new Error("Failed to upload Award");
                }
            }
        }

    } catch (e) {
        const err = e as Error;
        console.error(err);
        error(500, err.message);
    }

    return json({ message: "OK" }, {status: 200});
};