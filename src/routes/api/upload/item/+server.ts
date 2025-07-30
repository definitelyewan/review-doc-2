import { json } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import env from '$lib/server/env';
import db from '$lib/server/db';
import igdb from '$lib/server/igdb';
import tmdb from '$lib/server/tmdb.js';

export async function GET ({ request, url }) {

    const searchType: string | null = url.searchParams.get('searchType');
    const term: string | null = url.searchParams.get('term');
    const searchTypes: string[] = ["tv","game","movie"];
    let result = {tv: {}, game: {}, movie: {}};

    /*
     * validate the request
     */

    if (request.headers.get('Authorization') == undefined) {
        error(400, 'Authorization not provided');
    }

    if (env.rdAPIKey() !== request.headers.get('Authorization')) {
        error(400, 'Unauthorized request');
    }


    if (term == null) {
        error(400, 'Invalid request');
    }

    // if searchType is undefined search all external apis
    if (searchType == null) {

        result.game = await igdb.searchByName(term);
        result.movie = await tmdb.searchMoviesByName(term);
        result.tv = await tmdb.searchTVByName(term);

    // if searchType is included just seach for that single type
    } else {

        try {
            if (!searchTypes.includes(searchType)) {
                throw new Error("Invalid item type");
            }

            if (searchType == 'game') {
                result.game = await igdb.searchByName(term);
            } else if (searchType == 'tv') {
                result.tv = tmdb.searchTVByName(term);
            } else if (searchType == 'movie') {
                result.movie = await tmdb.searchMoviesByName(term);
            }


        } catch (e) {
            const err = e as Error;
            console.error(err);
            error(500, "Internal server error when requesting [" + searchType + "] which is not on of the following : " + searchTypes);
        }
        
    }

    return json({ data : result }, {status: 200});
}

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
        external_id: number, // external id
        item_type: string,
        item_cover_overide_url: string | undefined,
        item_banner_overide_url: string | undefined,
        item_name: string | undefined,
        item_date: string | undefined

    }

    let bodyContent: BodyContent = await request.json();

    if (!bodyContent.external_id || !bodyContent.item_type) {
        error(400, 'Invalid request body: Missing required fields');
    }

    
    if (bodyContent.item_type == 'game') {

        // get cover hash to avoid api requests later IGDB can be kinda slow
        if (bodyContent?.item_cover_overide_url == undefined){
            const igdbCoverResult = await igdb.getCoverByID(bodyContent.external_id);

            if (igdbCoverResult.length != 0) {
                bodyContent.item_cover_overide_url = igdbCoverResult[0].url;
                bodyContent.item_cover_overide_url = bodyContent.item_cover_overide_url?.replace('t_thumb','t_1080p');
            } 
        }

        if (bodyContent?.item_banner_overide_url == undefined){
            const igdbBannerResult = await igdb.getArtworkByID(bodyContent.external_id);
    
            if (igdbBannerResult.length != 0) {
                bodyContent.item_banner_overide_url = igdbBannerResult[0].url;
                bodyContent.item_banner_overide_url = bodyContent.item_banner_overide_url?.replace('t_thumb','t_1080p');
            }
        }

        const igdbResult = await igdb.searchByID(bodyContent.external_id);

        // get name if its not given
        if (bodyContent?.item_name == undefined) {
            bodyContent.item_name = igdbResult.name;
        }

        if (bodyContent?.item_date == undefined) {
            bodyContent.item_date = new Date(igdbResult.first_release_date * 1000).toISOString().split('T')[0];
        }


    } else if (bodyContent.item_type == 'tv') {
        const tmdbResult = await tmdb.searchByID(bodyContent.external_id, 'tv');

        if (bodyContent.item_name == undefined) {
            bodyContent.item_name = tmdbResult.name;
            
        }

        if (bodyContent.item_date == undefined) {
            bodyContent.item_date = tmdbResult.first_air_date;
        }

        if (bodyContent.item_cover_overide_url == undefined) {
            bodyContent.item_cover_overide_url = 'https://image.tmdb.org/t/p/original' + String(tmdbResult.poster_path);
        }

        if (bodyContent.item_banner_overide_url == undefined) {
            bodyContent.item_banner_overide_url = 'https://image.tmdb.org/t/p/original' + String(tmdbResult.backdrop_path);
        }


    } else if (bodyContent.item_type == 'movie') {
        const tmdbResult = await tmdb.searchByID(bodyContent.external_id, 'movie');

        if (bodyContent.item_name == undefined) {
            bodyContent.item_name = tmdbResult.title;
        }

        if (bodyContent.item_date == undefined) {
            bodyContent.item_date = tmdbResult.release_date;
        }

        if (bodyContent.item_cover_overide_url == undefined) {
            bodyContent.item_cover_overide_url = 'https://image.tmdb.org/t/p/original' + String(tmdbResult.poster_path);
        }

        if (bodyContent.item_banner_overide_url == undefined) {
            bodyContent.item_banner_overide_url = 'https://image.tmdb.org/t/p/original' + String(tmdbResult.backdrop_path);
        }

    
    }else if (bodyContent.item_type == 'other') {

        if (bodyContent.item_banner_overide_url == undefined || bodyContent.item_cover_overide_url == undefined || bodyContent.item_date == undefined || bodyContent.item_name == undefined || bodyContent.item_date == undefined) {
            error(400, 'All fields are required for type other however, id will be discarded on upload');
        }

    } else {
        error(400, "unsupported type");
    }


    try {

        // calculate id
        const latest: number = await db.getMaxTableID("item");

        if (latest == -1) {
            throw new Error("Failed to calculate a new ID");
        }
        

        const insert = await db.insertItem(latest + 1, bodyContent.external_id, bodyContent.item_type, bodyContent?.item_cover_overide_url, bodyContent?.item_banner_overide_url, bodyContent?.item_name, bodyContent?.item_date);

        if (!insert.success) {
            throw new Error("Failed insert of external item");
        }


    } catch (e) {
        const err = e as Error;
        console.error(err);
        error(500, "Error adding content");
    }

    return json({ message : "OK" }, {status: 200});

}