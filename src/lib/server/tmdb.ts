/**
 * A module for interacting with the TMDB api
 */

import env from '$lib/server/env'

const access_token = env.rdTMDBReadAccessToken();
//https://api.themoviedb.org/3/search/movie?query=test&include_adult=false&language=en-US&page=1
/**
 * Querys a given TMDB endpoint with a given query
 * @param method 
 * @param query 
 * @returns JSON
 */
async function query(method: string, query: string) {


    query = query.replace(/ /g, '%20');

    try {
        const response = await fetch(`https://api.themoviedb.org/3/${query}`, {
            method: method,
            headers: {
                'Authorization': `Bearer ${access_token}`,
            }
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
 * search TMDB for movies that match a name
 * @param name 
 */
async function searchMoviesByName(name: string) {
    return await query('GET', `search/movie?query=${name}&include_adult=false&language=en-US&page=1`);
}

/**
 * search TMDB for tv shows that match a name
 * @param name 
 */
async function searchTVByName(name: string) {
    return await query('GET', `search/tv?query=${name}&include_adult=false&language=en-US&page=1`);
}

/**
 * Search for an ID within a type
 * @param id 
 * @param type 
 * @returns 
 */
async function searchByID(id: number, type: string) {
    return await query('GET', `${type}/${id}?language=en-US`);
}

export default {
    query,
    searchMoviesByName,
    searchTVByName,
    searchByID
}