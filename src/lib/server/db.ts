/**
 * A module for interacting with a mariadb database
 */

import mariadb from 'mariadb';
import fs from 'fs/promises';
import env from './env';
import { error } from 'console';


const tableNames: string[] = ["review", "award", "item"];

// connects to a instance of mariadb using a .env file in the project directory

const pool = mariadb.createPool({
    host: env.dbHost(),
    user: env.dbUser(),
    password: env.dbPassword(),
    database: env.dbName(),
    charset: env.dbCharset(),
    port: env.dbPort(),
    connectionLimit: 5
});

/**
 * Query the database and returns the result
 * @param {string} sql 
 * @returns 
 */
async function query(sql: string, params?: any[]) {
    let conn;
    try {
        conn = await pool.getConnection();
        const res = await conn.query(sql, params); // Pass parameters to the query
        return res;
    } catch (err) {
        return err;
    } finally {
        if (conn) conn.end();
    }
}

/**
 * drops a table from the database by its name
 * @param {string} tableName 
 */
async function dropTable(tableName: string) {
    return await query(`DROP TABLE IF EXISTS ${tableName}`);
}

/**
 * generates a schema via dropping existing tables and replacing them with empty tables
 */
async function schema() {
    try {

        for (let tableName of tableNames) {

            let dropResult = await dropTable(tableName);

            if (dropResult?.errno > 0) {
                throw error("[ERROR] Fatal error when dropping " + tableName);
            } else {
                console.log("dropped " + tableName);
            }

        }

        const itemSchema = await query(`
            CREATE TABLE IF NOT EXISTS item (
                item_id INT AUTO_INCREMENT PRIMARY KEY,
                item_cover_overide_url TEXT DEFAULT NULL,
                item_banner_overide_url TEXT DEFAULT NULL,
                item_type VARCHAR(6), 
                external_id INT,
                item_name TEXT,
                item_date TEXT 
            );
        `);
        
        if (itemSchema?.errno > 0) {
            throw error("[ERROR] Fatal error generating " + itemSchema);
        } else {
            console.log("item table generated");
        }

        const reviewSchema = await query(`
            CREATE TABLE IF NOT EXISTS review (
                review_id INT AUTO_INCREMENT PRIMARY KEY,
                item_id INT,
                FOREIGN KEY (item_id) REFERENCES item(item_id) ON DELETE CASCADE,
                review_score INT DEFAULT -1,
                review_md TEXT,
                review_sub_name TEXT,
                review_date DATE DEFAULT CURRENT_DATE NOT NULL,
                review_rewatch BOOLEAN DEFAULT false
            );
        `);

        if (reviewSchema?.errno > 0) {
            throw error("[ERROR] Fatal error generating " + reviewSchema);
        } else {
            console.log("review table generated");
        }

        const awardSchema = await query(`
            CREATE TABLE IF NOT EXISTS award (
                award_id INT AUTO_INCREMENT PRIMARY KEY,
                item_id INT,
                FOREIGN KEY (item_id) REFERENCES item(item_id) ON DELETE CASCADE,
                award_name TEXT,
                award_year INT,
                award_granted BOOLEAN DEFAULT FALSE
            );
        `);

        if (awardSchema?.errno > 0) {
            throw error("[ERROR] Fatal error generating " + awardSchema);
        } else {
            console.log("award table generated");
        }


    } catch (e) {
        const err = e as Error;
        console.error(err);
        return { success: false, error: err.message };
    }

    return { success: true };
}

/**
 * converts the required sql tabes to a json formate and stores the results in the users specified backup dir
 */
async function toJsonFile() {

    // file name
    const currentDate = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

    // make a file
    try {
        await fs.writeFile(`${env.rdBackupDir()}${currentDate}`, "", 'utf-8');
    } catch (e) {
        const err = e as Error;
        console.error(err);
        return { success: false, error: err.message };
    }

    try {

        let items: [] = await query(`SELECT * FROM item`);
        let reviews: [] = await query(`SELECT * FROM review`);
        let awards: [] = await query(`SELECT * FROM award`);

        if (items == undefined) {
            throw new Error('[ERROR] Fatal error items table not backed up');
        }


        let jsonData = {item: items, review: reviews, award: awards};

        await fs.appendFile(`${env.rdBackupDir()}${currentDate}`, JSON.stringify(jsonData), 'utf-8');

        return { success: true};

    } catch (e) {
        const err = e as Error;
        console.error(err);
        return { success: false, error: err.message };
    }


    
}


/**
 * opens a file stored in the backup dir and uses its keys to repopulate a database
 * @param filePath 
 */
async function fileToDatabase(fileName: string) {

    try {

        const data = await fs.readFile(fileName, 'utf-8');
        const parsedData = JSON.parse(data);

        for (let itemData of parsedData.item) {
            const sqlItemInsert = await insertItem(itemData.item_id, itemData.external_id, itemData.item_type, itemData.item_cover_overide_url, itemData.item_banner_overide_url, itemData.item_name, itemData.item_date);

            if (!sqlItemInsert.success) {
                throw new Error(sqlItemInsert.error);
            }
        }

        for (let reviewData of parsedData.review) {
            const sqlReviewInsert = await insertReview(reviewData.review_id, reviewData.item_id, reviewData.review_sub_name, reviewData.review_score, reviewData.review_md, reviewData.review_date, reviewData.rewatch);
        
            if (!sqlReviewInsert.success) {
                throw new Error(sqlReviewInsert.error);
            }
        }

        for (let awardData of parsedData.award) {
            const sqlAwardInsert = await insertAward(awardData.award_id, awardData.item_id, awardData.award_granted, awardData.award_name, awardData.award_year);
            
            if (!sqlAwardInsert.success) {
                throw new Error(sqlAwardInsert.error);
            }
        }

    } catch (e) {
        const err = e as Error;
        console.error(err);
        return {success : false, error : 'unable to rebuild database'};

    }

    return {success : true};
}

/**
 * Inserts an item into the items table
 * @param id
 * @param externalId 
 * @param type 
 * @param coverOveride 
 * @param bannerOveride 
 * @param name
 * @returns 
 */
async function insertItem(id: number, externalId: number, type: string, coverOveride?: string, bannerOveride?: string, name?: string, date?: string) {

    try {

        const sqlInsert = await query("INSERT INTO item(item_id, external_id, item_type) VALUES(?, ?, ?)", [id, externalId, type]);

        if (sqlInsert?.errno) {
            throw new Error("Failed to insert into item");
        }

        if (coverOveride) {

            const sqlCoverUpdate = await query("UPDATE item SET item_cover_overide_url = ? WHERE item_id = ?", [coverOveride, id])
            
            if (sqlCoverUpdate?.errno) {
                throw new Error("Failed to update item cover");
            }

        }

        if (bannerOveride) {
            const sqlBannerUpdate = await query("UPDATE item SET item_banner_overide_url = ? WHERE item_id = ?", [bannerOveride, id])
            
            if (sqlBannerUpdate?.errno) {
                throw new Error("Failed to update item banner");
            }
        }

        if (name) {
            const sqlNameUpdate = await query("UPDATE item SET item_name = ? WHERE item_id = ?", [name, id])
            
            if (sqlNameUpdate?.errno) {
                throw new Error("Failed to update item name");
            }
        }

        if (date) {
            const sqlDateUpdate = await query("UPDATE item SET item_date = ? WHERE item_id = ?", [date, id])
            
            if (sqlDateUpdate?.errno) {
                throw new Error("Failed to update item date");
            }
        }


    } catch (e) {
        const err = e as Error;
        console.error(err);
        return { success: false, error: err.message };

    }

    return { success: true };
}

/**
 * Reads a row from the item table by a given id
 * @param id 
 */
async function getItem(id: number) {

    const item = await query("SELECT * FROM item WHERE item_id = ?", [id]);
    
    if (item.length == 0) {
        return {};
    }

    return item[0];
}

/**
 * inserts a review into the review table
 * @param id 
 * @param itemId 
 * @param subName 
 * @param reviewScore 
 * @param markDown 
 * @param date 
 * @param rewatch
 * @returns 
 */
async function insertReview(id: number, itemId : number, subName : string, reviewScore?: number, markDown?: string, date?: string, rewatch?: boolean) {

    try {

        const sqlInsert = await query("INSERT INTO review(review_id, item_id, review_sub_name) VALUES(?, ?, ?)", [id, itemId, subName]);

        if (sqlInsert?.errno) {
            throw new Error("Failed to insert into review");
        }

        if (reviewScore != undefined) {

            const addScore = await query("UPDATE review SET review_score = ? WHERE review_id = ?", [reviewScore, id]);
        
            if (addScore?.errno) {
                throw new Error("Failed to add score");
            } 

        }

        if (markDown) {
            
            const markDownAdd = await query("UPDATE review SET review_md = ? WHERE review_id = ?", [markDown, id]);

            if (markDownAdd?.errno) {
                throw new Error("Failed to add md");
            }
        }

        if (date) {
            const dateType = new Date(date);
            const dateAdd = await query("UPDATE review SET review_date = ? WHERE review_id = ?", [dateType.toISOString().slice(0, 10), id]);

            if (dateAdd?.errno) {
                throw new Error("Failed to add date");
            }
        }

        if (rewatch) {
            const rewatchAdd = await query("UPDATE review SET review_rewatch = ? WHERE review_id = ?", [rewatch, id]);

            if (rewatchAdd?.errno) {
                throw new Error("Failed to add rewatch");
            }

        }

    } catch (e) {
        const err = e as Error;
        console.error(err);
        return { success: false, error: err.message };
    }

    return { success: true };
}

/**
 * Returns an array of review rows that have id as the item id
 * @param id 
 * @returns 
 */
async function getReviewsByItem(id: number) {
    return await query("SELECT * FROM review WHERE item_id = ?", [id]);
}

/**
 * returns the average score for an item with id fixed to 1 decimal place.
 * @param id 
 * @returns float
 */
async function getItemAvgScore(id: number) {
    const reviews = await query('SELECT review_score FROM review WHERE item_id = ? AND review_score != -1', [id]);

    const nReviews = reviews.length;
    let total = 0;

    if (reviews.length == 0) {
        return 0;
    }

    for (let score of reviews) {
        total += score.review_score;
    }

    const result = total / nReviews

    return parseFloat(result.toFixed(1));
}

/**
 * returns a weighted averge based on the numbers fuound in an items review sub name with id.
 * @param id 
 * @returns 
 */
async function getItemNameWeightedAvgScore(id: number) {
    try {

        const reviews = await query('SELECT review_score, review_sub_name FROM review WHERE item_id = ? AND review_score != -1', [id]);

        if (!reviews || reviews.length === 0) {
            return 0; 
        }

        let totalWeightedScore = 0;
        let totalWeight = 0;

        for (const review of reviews) {
            const score = review.review_score;
            const subName = review.review_sub_name;

            // Extract numbers from review_sub_name and calculate the weight
            const weights = subName.match(/\d+/g) || [];
            const weight = weights.length;

            totalWeightedScore += score * weight;
            totalWeight += weight;
        }


        const weightedAvg = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

        return parseFloat(weightedAvg.toFixed(1));
    } catch (err) {
        console.error(err);
        return 0; // Return 0 in case of an error
    }
}

/**
 * returns all items
 * @returns 
 */
async function getAllItems () {
    return await query('SELECT * FROM item ORDER BY item_name');
}

/**
 * returns all reviews
 * @param id 
 * @returns 
 */
async function getAllReviews () {
    return await query('SELECT * FROM review ORDER BY review_date DESC');

}

/**
 * inserts into the award table
 * @param id 
 * @param itemId 
 * @param grant 
 * @param name 
 * @param year 
 * @returns 
 */
async function insertAward (id: number, itemId: number, grant: boolean, name: string, year?: number) {
    
    try {

        const sqlInsert = await query("INSERT INTO award(award_id, item_id, award_granted, award_name) VALUES(?, ?, ?, ?)", [id, itemId, grant, name]);

        if (sqlInsert?.errno) {
            throw new Error("Failed to insert into award");
        }

        if (year) {
            
            const addYear = await query("UPDATE award SET award_year = ? WHERE award_id = ?", [year, id]);
            
            if (addYear?.errno) {
                throw new Error("Failed to add score");
            }
        }

    } catch (e) {
        const err = e as Error;
        console.error(err);
        return { success: false, error: err.message };
    }

    return { success: true };
}

/**
 * gets the unique years in the awards table 
 * @returns number []
 */
async function getUniqueAwardYears() {
    const years = await query('SELECT UNIQUE award_year FROM award');

    if (years.length == 0) {
        return [];
    }


    let rYears: number [] = [];

    for (let year of years) {
        rYears.push(year.award_year);
    }

    return rYears;
}

/**
 * returns awards within a specific award
 * @param year 
 * @returns 
 */
async function getAwardsByYear(year: number) {
    return await query('SELECT * FROM award WHERE award_year = ?',[year]);
}

/**
 * Reads a row from the award table by a given id
 * @param id 
 */
async function getAward(id: number) {

    const item = await query("SELECT * FROM award WHERE award_id = ?", [id]);
    
    if (item.length == 0) {
        return {};
    }

    return item[0];
}

/**
 * Reads a row from the review table by a given id
 * @param id 
 */
async function getReview(id: number) {

    const item = await query("SELECT * FROM review WHERE review_id = ?", [id]);
    
    if (item.length == 0) {
        return {};
    }

    return item[0];
}


export default {
    schema,
    query,
    dropTable,
    toJsonFile,
    fileToDatabase,
    insertItem,
    getItem,
    insertReview,
    getReviewsByItem,
    getItemAvgScore,
    getItemNameWeightedAvgScore,
    getAllReviews,
    getAllItems,
    insertAward,
    getUniqueAwardYears,
    getAwardsByYear,
    getAward,
    getReview

};
