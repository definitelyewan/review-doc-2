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
        id: number, // external id
        type: string,
        cover: string | undefined,
        banner: string | undefined,
        name: string | undefined,
        date: string | undefined

    }

    let bodyContent: BodyContent = await request.json();

    if (!bodyContent.id || !bodyContent.type) {
        error(400, 'Invalid request body: Missing required fields');
    }

    
    if (bodyContent.type == 'game') {

        // get cover hash to avoid api requests later IGDB can be kinda slow
        if (bodyContent?.cover == undefined){
            const igdbCoverResult = await igdb.getCoverByID(bodyContent.id);

            if (igdbCoverResult.length != 0) {
                bodyContent.cover = igdbCoverResult[0].url;
                bodyContent.cover = bodyContent.cover?.replace('t_thumb','t_1080p');
            } 
        }

        if (bodyContent?.banner == undefined){
            const igdbBannerResult = await igdb.getArtworkByID(bodyContent.id);
    
            if (igdbBannerResult.length != 0) {
                bodyContent.banner = igdbBannerResult[0].url;
                bodyContent.banner = bodyContent.banner?.replace('t_thumb','t_1080p');
            }
        }

        const igdbResult = await igdb.searchByID(bodyContent.id);

        // get name if its not given
        if (bodyContent?.name == undefined) {
            bodyContent.name = igdbResult.name;
        }

        if (bodyContent?.date == undefined) {
            bodyContent.date = new Date(igdbResult.first_release_date * 1000).toISOString().split('T')[0];
        }


    } else if (bodyContent.type == 'tv') {
        const tmdbResult = await tmdb.searchByID(bodyContent.id, 'tv');

        if (bodyContent.name == undefined) {
            bodyContent.name = tmdbResult.name;
            
        }

        if (bodyContent.date == undefined) {
            bodyContent.date = tmdbResult.first_air_date;
        }

        if (bodyContent.cover == undefined) {
            bodyContent.cover = 'https://image.tmdb.org/t/p/original' + String(tmdbResult.poster_path);
        }

        if (bodyContent.banner == undefined) {
            bodyContent.banner = 'https://image.tmdb.org/t/p/original' + String(tmdbResult.backdrop_path);
        }


    } else if (bodyContent.type == 'movie') {
        const tmdbResult = await tmdb.searchByID(bodyContent.id, 'movie');

        if (bodyContent.name == undefined) {
            bodyContent.name = tmdbResult.title;
        }

        if (bodyContent.date == undefined) {
            bodyContent.date = tmdbResult.release_date;
        }

        if (bodyContent.cover == undefined) {
            bodyContent.cover = 'https://image.tmdb.org/t/p/original' + String(tmdbResult.poster_path);
        }

        if (bodyContent.banner == undefined) {
            bodyContent.banner = 'https://image.tmdb.org/t/p/original' + String(tmdbResult.backdrop_path);
        }

    
    }else if (bodyContent.type == 'other') {

        if (bodyContent.banner == undefined || bodyContent.cover == undefined || bodyContent.date == undefined || bodyContent.name == undefined || bodyContent.date == undefined) {
            error(400, 'All fields are required for type other however, id will be discarded on upload');
        }

    } else {
        error(400, "unsupported type");
    }


    try {

        // calculate id
        const latest = await db.query('SELECT MAX(item_id) AS latest_id FROM item');
        let newId: number = 1;

        if (!(latest[0].latest_id == null)) {
            newId = latest[0].latest_id + 1;
        }
        

        const insert = await db.insertItem(newId, bodyContent.id, bodyContent.type, bodyContent?.cover, bodyContent?.banner, bodyContent?.name, bodyContent?.date);

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