/**
 * A module for interacting with a mariadb database
 */

import mariadb from 'mariadb';
import fs from 'fs/promises';
import env from './env';
import { error } from 'console';
import type { itemStructure } from '$lib/types';


const tableNames: string[] = ["link", "list_item", "review", "award", "item", "list"];

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

        const listSchema = await query(`
            CREATE TABLE IF NOT EXISTS list (
                list_id INT AUTO_INCREMENT PRIMARY KEY,
                list_name TEXT NOT NULL,
                list_desc TEXT DEFAULT NULL
            );
        `);

        if (listSchema?.errno > 0) {
            throw error("[ERROR] Fatal error generating " + listSchema);
        } else {
            console.log("list table generated");
        }

        const listItemSchema = await query(`
            CREATE TABLE IF NOT EXISTS list_item (
                list_id INT,
                item_id INT,
                PRIMARY KEY(list_id, item_id),
                FOREIGN KEY (list_id) REFERENCES list(list_id),
                FOREIGN KEY (item_id) REFERENCES item(item_id)
            );
        `);

        if (listItemSchema?.errno > 0) {
            throw error("[ERROR] Fatal error generating " + listItemSchema);
        } else {
            console.log("list_item table generated");
        }

        const linkSchema = await query(`
            CREATE TABLE IF NOT EXISTS link (
                link_id INT AUTO_INCREMENT PRIMARY KEY,
                item_id_1 INT,
                item_id_2 INT,
                FOREIGN KEY (item_id_1) REFERENCES item(item_id),
                FOREIGN KEY (item_id_2) REFERENCES item(item_id)
            );`);

        if (linkSchema?.errno > 0) {
            throw error("[ERROR] Fatal error generating " + linkSchema);
        } else {
            console.log("link table generated");
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
        let jsonData: Record<string, any[]> = {};

        for (let tableName of tableNames) {
            let tableData = await query(`SELECT * FROM ${tableName}`);

            if (tableData?.errno) {
                console.error("[ERROR] Failed to backup " + tableName);
            } else {
                jsonData[tableName] = tableData;
            }

            
        }

        await fs.appendFile(`${env.rdBackupDir()}${currentDate}`, JSON.stringify(jsonData), 'utf-8');

        return { success: true };

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
            const sqlReviewInsert = await insertReview(reviewData.review_id, 
                                                        reviewData.item_id, 
                                                        reviewData.review_sub_name, 
                                                        reviewData.review_score, 
                                                        reviewData.review_md, 
                                                        reviewData.review_date, 
                                                        reviewData.review_rewatch);
        
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

        for (let listData of parsedData.list) {
            const sqllistInsert = await insertList(listData.list_id, listData.list_name, listData.list_desc);
            
            if (!sqllistInsert.success) {
                throw new Error(sqllistInsert.error);
            }
        }

        for (let listItemData of parsedData.list_item) {
            const sqllistItemInsert = await insertListItem(listItemData.list_id, listItemData.item_id);
            
            if (!sqllistItemInsert.success) {
                throw new Error(sqllistItemInsert.error);
            }
        }

        if (parsedData.link != undefined) {
            for (let link of parsedData.link) {
                const sqlLinkInsert = await insertLink(link.link_id, link.item_id_1, link.item_id_2);

                if (!sqlLinkInsert.success) {
                    throw new Error(sqlLinkInsert.error);
                }
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

        if (rewatch == true) {
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

/**
 * inserts a list into the database
 * @param id 
 * @param name 
 * @param description 
 * @returns boolean
 */
async function insertList(id: number, name: string, description?: string) {
    try {

        const sqlInsert = await query("INSERT INTO list(list_id, list_name) VALUES(?, ?)", [id, name]);

        if (description) {
            const addDesc = await query("UPDATE list SET list_desc = ? WHERE list_id = ?", [description, id]);
            
            if (addDesc?.errno) {
                throw new Error("Failed to add description");
            }
        }

        if (sqlInsert?.errno) {
            throw new Error("Failed to insert into list");
        }

    } catch (e) {
        const err = e as Error;
        console.error(err);
        return { success: false, error: err.message };
    }

    return { success: true };
}

/**
 * Inserts a list id and item id into a junction table
 * @param listId 
 * @param itemId 
 * @returns number
 */
async function insertListItem(listId: number, itemId: number) {

    try {

        const sqlInsert = await query("INSERT INTO list_item(list_id, item_id) VALUES(?, ?)", [listId, itemId]);

        if (sqlInsert?.errno) {
            throw new Error("Failed to insert into list_item");
        }

    } catch (e) {
        const err = e as Error;
        console.error(err);
        return { success: false, error: err.message };
    }

    return { success: true };

}

/**
 * returns the current max id in a table. if the table does not exist or it does not contain an id -1 is returned.
 * @param tableName 
 * @returns number
 */
async function getMaxTableID(tableName: string) {

    const latest = await query(`SELECT MAX(${tableName}_id) AS latest_id FROM ${tableName}`);
    let newId: number = 1;

    if (!(latest[0].latest_id == null)) {
        newId = latest[0].latest_id;
    } else {
        newId = -1;
    }

    return newId;
}

/**
 * returns a list table row
 * @param id 
 * @returns 
 */
async function getList(id: number) {
    const list = await query("SELECT * FROM list WHERE list_id = ?", [id]);
    
    if (list.length == 0) {
        return {};
    }

    return list[0];
}

/**
 * returns an array of every item id in a list
 * @param id 
 * @returns number []
 */
async function getListMembers(id: number) {
    const listMembers = await query("SELECT * FROM list_item WHERE list_id = ?", [id]);

    if (listMembers.length == 0) {
        return [];
    }

    let memberIds: number [] = [];

    for (let ids of listMembers) {
        memberIds.push(ids.item_id);
    }

    return memberIds;
}

/**
 * returns eveyr list
 * @returns
 */
async function getAllLists () {
    return await query('SELECT * FROM list');

}

/**
 * Edit the content of an award entry by its id. throws an error if not successful
 * @param award_id 
 * @param item_id 
 * @param award_name 
 * @param award_year 
 * @param award_granted 
 */
async function editAward(award_id: number, item_id: number | undefined, award_name: string | undefined, award_year: number | undefined, award_granted: boolean | undefined) {

    try{

        // build a query that supports all undefined columns
        let setStrings: string [] = [];
        let values: string [] = [];
        let sql = '';

        if (award_id < 1) {
            throw new Error("Invalid award id");
        }
        
        let testAward = await getAward(award_id);

        if (testAward?.award_id == undefined) {
            throw new Error("Invlaid award id");
        }

        // test item_id
        if (item_id != undefined) {
            if (item_id < 1) {
                throw new Error("Invalid item id");
            }

            let testItem = await getItem(item_id);

            if (testItem?.item_id == undefined) {
                throw new Error("Invalid item id");
            }

            setStrings.push("item_id");
            values.push(item_id.toString());
        }

        // test award_name
        if (award_name != undefined) {
            setStrings.push("award_name");
            values.push(award_name);
        }

        // test award_year
        if (award_year != undefined) {

            if (award_year < 1000 || award_year > 9999) {
                throw new Error("Invalid award year");
            }

            setStrings.push("award_year");
            values.push(award_year.toString());
        }

        if (award_granted != undefined) {
            setStrings.push("award_granted");
            values.push(award_granted == true ? '1' : '0');
        }

        

        for (let i = 0; i < setStrings.length; i++) {

            sql = sql + setStrings[i] + " = ?"
            
            if (i < setStrings.length - 1) {
                sql = sql + ', ';
            }

        }

        if (sql.length == 0) {
            throw new Error("Noting to update");
        }
        
        values.push(award_id.toString());

        const sqlQuery = await query("UPDATE award SET " + sql + " WHERE award_id = ?", values);

        if (sqlQuery?.errno) {
            throw new Error("Failed to update award");
        }

    } catch (e) {
        const err = e as Error;
        console.error(err);
        throw err;
    }
}

/**
 * edit the content of an item entry by its id. Throws an error if unsuccessful
 * @param item_id 
 * @param external_id 
 * @param item_cover_overide_url 
 * @param item_banner_overide_url 
 * @param item_type 
 * @param item_name 
 * @param item_date 
 */
async function editItem(item_id: number, external_id: number | undefined, item_cover_overide_url: string | undefined, item_banner_overide_url: string | undefined, item_type: string | undefined, item_name: string | undefined, item_date: string | undefined) {
    try {
        
        // build a query that supports all undefined columns
        let setStrings: string [] = [];
        let values: string [] = [];
        let sql = '';

        if (item_id < 1) {
            throw new Error("Invalid item id");
        }

        const testItem = await getItem(item_id);

        if (testItem?.item_id == undefined) {
            throw new Error("Invalid item id");
        }

        if (external_id != undefined) {
            setStrings.push("external_id");
            values.push(external_id.toString());
        }

        if (item_banner_overide_url != undefined) {
            setStrings.push("item_banner_overide_url");
            values.push(item_banner_overide_url);
        }

        if (item_cover_overide_url != undefined) {
            setStrings.push("item_cover_overide_url");
            values.push(item_cover_overide_url);
        }


        if (item_type != undefined) {
            if (item_type.length > 6) {
                throw new Error("Item type too long");
            }

            setStrings.push("item_type");
            values.push(item_type);
        }

        if (item_name != undefined) {
            setStrings.push("item_name");
            values.push(item_name);
        }

        if (item_date != undefined) {
            const regex = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;

            if (!regex.test(item_date)) {
                throw new Error("Invalid date string yyyy-mm-dd");
            }

            setStrings.push("item_date");
            values.push(item_date);
        }


        for (let i = 0; i < setStrings.length; i++) {

            sql = sql + setStrings[i] + " = ?"
            
            if (i < setStrings.length - 1) {
                sql = sql + ', ';
            }

        }

        if (sql.length == 0) {
            throw new Error("Noting to update");
        }
        
        values.push(item_id.toString());

        const sqlQuery = await query("UPDATE item SET " + sql + " WHERE item_id = ?", values);

        if (sqlQuery?.errno) {
            throw new Error("Failed to update item");
        }

    } catch (e) {
        const err = e as Error;
        console.error(err);
        throw err;
    }
}

/**
 * edit the content of a review by its id. Throws an error if unseccuessful
 * @param review_id 
 * @param item_id 
 * @param review_score 
 * @param review_md 
 * @param review_sub_name 
 * @param review_date 
 * @param review_rewatch 
 */
async function editReview(review_id: number, item_id: number | undefined, review_score: number | undefined, review_md: string | undefined, review_sub_name: string | undefined, review_date: string | undefined, review_rewatch: boolean | undefined) {

    try {
        // build a query that supports all undefined columns
        let setStrings: string [] = [];
        let values: string [] = [];
        let sql = '';

        if (review_id < 1) {
            throw new Error("Invalid review id");
        }

        const testReview = await getReview(review_id);

        if (testReview?.review_id == undefined) {
            throw new Error("Invalid review id");
        }


        if (item_id != undefined) {
            if (item_id < 1) {
                throw new Error("Invalid item id");
            }

            setStrings.push("item_id");
            values.push(item_id.toString());
        }

        if (review_score != undefined) {
            setStrings.push("review_score");
            values.push(review_score.toString());
        }

        if (review_md != undefined) {
            setStrings.push("review_md");
            values.push(review_md);
        }

        if (review_sub_name != undefined) {
            setStrings.push("review_sub_name");
            values.push(review_sub_name);
        }

        if (review_date != undefined) {
            const regex = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;

            if (!regex.test(review_date)) {
                throw new Error("Invalid date string yyyy-mm-dd");
            }

            setStrings.push("review_date");
            values.push(review_date);
        }

        if (review_rewatch != undefined) {
            setStrings.push("review_rewatch");
            values.push(review_rewatch == true ? '1' : '0');
        }
        
        values.push(review_id.toString());


        for (let i = 0; i < setStrings.length; i++) {

            sql = sql + setStrings[i] + " = ?"
            
            if (i < setStrings.length - 1) {
                sql = sql + ', ';
            }

        }

        if (sql.length == 0) {
            throw new Error("Noting to update");
        }

        const sqlQuery = await query("UPDATE review SET " + sql + " WHERE review_id = ?", values);

        if (sqlQuery?.errno) {
            throw new Error("Failed to update award");
        }

    } catch (e) {
        const err = e as Error;
        console.error(err);
        throw err;
    }
}

/**
 * edit the content of a list by its id. Throws an error if unseccuessful
 * @param list_id 
 * @param list_name 
 * @param list_desc 
 * @param list_item 
 */
async function editList(list_id: number, list_name: string | undefined, list_desc: string | undefined, list_item: number [] | undefined) {
    
    try{

        let listTest = await getList(list_id);

        if (listTest?.list_id == undefined) {
            throw new Error("Invalid list id");
        }

        let setStrings: string [] = [];
        let values: string [] = [];
        let sql = '';

        if (list_name != undefined) {
            setStrings.push("list_name");
            values.push(list_name);
        }

        if (list_desc != undefined) {
            setStrings.push("list_desc");
            values.push(list_desc);
        }

        if (list_item != undefined) {

            // test item ids

            for (let id of list_item) {
                let testItem = await getItem(id);

                if (testItem?.item_id == undefined) {
                    throw new Error("One of more item ids are not valid");
                }
            }

            let listMembers = await getListMembers(list_id);

            for (let listMember of listMembers) {
                await query("DELETE FROM list_item WHERE list_id = ? AND item_id = ?",[list_id, listMember]);
            }

            for (let id of list_item) {
                const insertSql = await insertListItem(list_id, id);

                if (insertSql?.success == false) {
                    throw new Error("Unable to replace one or more list members");
                }
            }
        }
        
        for (let i = 0; i < setStrings.length; i++) {

            sql = sql + setStrings[i] + " = ?"
            
            if (i < setStrings.length - 1) {
                sql = sql + ', ';
            }

        }

        if (sql.length > 0) {
            values.push(list_id.toString());

            const sqlQuery = await query("UPDATE list SET " + sql + " WHERE list_id = ?", values);

            if (sqlQuery?.errno) {
                throw new Error("Failed to update item");
            }
        }



    } catch (e) {
        const err = e as Error;
        console.error(err);
        throw err;
    }
}

/**
 * Gets all linked items for a particular item id
 * @param item_id 
 * @returns []
 */
async function getLinkedItems(item_id: number) {
    const linkedItems = await query("SELECT item.* FROM link INNER JOIN item ON link.item_id_2 = item.item_id WHERE link.item_id_1 = ?", [item_id]);
    
    if (linkedItems.length == 0) {
        return [];
    }

    return linkedItems;
}

/**
 * Gets all awards for an item
 * @param id 
 * @returns []
 */
async function getAwardsByItem(id: number) {
    const awards = await query("SELECT * FROM award WHERE item_id = ?", [id]);

    if (awards.length == 0) {
        return [];
    }

    return awards
}

/**
 * Inserts a new link and returns true on success
 * @param item_id_1 
 * @param item_id_2 
 * @returns boolean
 */
async function insertLink(id: number, item_id_1: number, item_id_2: number) {
    

    try {
        const insertSql = await query("INSERT INTO link(link_id, item_id_1, item_id_2) VALUES(?, ?, ?)", [id, item_id_1, item_id_2]);

        if (insertSql?.errno) {
            throw new Error("Failed to make link");
        }
    } catch (e) {
        const err = e as Error;
        console.error(err);
        return { success: false, error: err.message };

    }

    return { success: true };
}

/**
 * returns a link row based on its id
 * @param id 
 * @returns 
 */
async function getLink(id: number) {
    const item = await query("SELECT * FROM link WHERE link_id = ?", [id]);
    
    if (item.length == 0) {
        return {};
    }

    return item[0];
}

/**
 * edits a pre existing link by its id
 * @param id 
 * @param item_id_1 
 * @param item_id_2 
 */
async function editLink(id: number, item_id_1: number | undefined, item_id_2: number | undefined) {

    try {

        if (id < 1) {
            throw new Error("Invalid link id");
        }

        let testLink = await getLink(id);

        if (testLink?.link_id == undefined) {
           throw new Error("Invalid link id");
        }

        let setStrings: string [] = [];
        let values: string [] = [];
        let sql = '';

        if (item_id_1 != undefined) {

            testLink = await getItem(item_id_1);

            if (testLink?.item_id == undefined) {
                throw new Error("Invalid item id");
            }

            setStrings.push("item_id_1");
            values.push(item_id_1.toString());
        }

        if (item_id_2 != undefined) {

            testLink = await getItem(item_id_2);

            if (testLink?.item_id == undefined) {
                throw new Error("Invalid item id");
            }

            setStrings.push("item_id_2");
            values.push(item_id_2.toString());
        }

        for (let i = 0; i < setStrings.length; i++) {

            sql = sql + setStrings[i] + " = ?"
            
            if (i < setStrings.length - 1) {
                sql = sql + ', ';
            }

        }

        if (sql.length == 0) {
            throw new Error("Noting to update");
        }
        
        values.push(id.toString());

        const sqlQuery = await query("UPDATE link SET " + sql + " WHERE link_id = ?", values);

        if (sqlQuery?.errno) {
            throw new Error("Failed to update award");
        }

    }  catch (e) {
        const err = e as Error;
        console.error(err);
        throw err;
    }
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
    getReview,
    insertList,
    insertListItem,
    getMaxTableID,
    getList,
    getListMembers,
    getAllLists,
    editAward,
    editItem,
    editReview,
    editList,
    getLinkedItems,
    getAwardsByItem,
    insertLink,
    getLink,
    editLink
};
