/**
 * A module for interacting with Twitch's IGDB API
 */

import env from '$lib/server/env';


let credentials = {
    base_url: 'https://id.twitch.tv/oauth2/token',
    client_id: env.rdIGDBClient(),
    client_secret: env.rdIGDBSecret(),
    grant_type: 'client_credentials',
    auth: {
        token_type: undefined,
        access_token: undefined

    }
}

/**
 * Uses the client_id and client_secret to authenticate with the Twitch api
 */
async function twitch_auth() {
    try {
        const response = await fetch(`${credentials.base_url}?client_id=${credentials.client_id}&client_secret=${credentials.client_secret}&grant_type=${credentials.grant_type}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok) {
            console.error(response);
            throw new Error('Network response was not ok');
        }

        credentials.auth = await response.json();

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

/**
 * Query IGDB via endpoint baseURL
 * @param baseUrl 
 * @param query 
 * @returns object
 */
async function query(baseUrl: string, query: string) {

    try {

        // authenticate with twitch
        if (credentials.auth.token_type == undefined || credentials.auth.access_token == undefined) {
            await twitch_auth();
        }

        const response = await fetch(`https://api.igdb.com/v4/${baseUrl}`, {
            method: 'POST',
            headers: {
                'Client-ID': credentials.client_id,
                'Authorization': `${credentials.auth.token_type} ${credentials.auth.access_token}`,
            },
            body: query
        });

        if (!response.ok) {
            console.error(response);
            throw new Error('Network response was not ok');
        }

        return await response.json();

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }

}

/**
 * returns all parent games via the search term name
 * @param name 
 * @returns 
 */
async function searchByName(name: string) {
    return await query('games',`fields *; search "${name}"; where (version_parent = null);`);
}

/**
 * returns a cover object from via a game reference id
 * @param id 
 * @returns 
 */
async function getCoverByID(id: number) {
    return await query('covers',`fields *; where game = ${id};`);
}

/**
 * returns all fields related to a game via its id
 * @param id 
 * @returns 
 */
async function searchByID(id: number) {


    const result = await query('games',`fields *; where (version_parent = null) & id = ${id};`);

    if (result.length == 0) {
        return {};
    }

    return result[0];
    
}

async function getArtworkByID(id: number) {
    return await query('artworks',`fields *; where game = ${id};`);
}

export default {
    query,
    searchByName,
    getCoverByID,
    searchByID,
    getArtworkByID
}