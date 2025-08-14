
import { authenticator } from 'otplib';
import bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import jwt from 'jsonwebtoken';
import env from '$lib/server/env';


const saltRounds: number = 10;
let hashedPass: string = await bcrypt.hash(env.rdAPIKey(), saltRounds); 
const seed: string = env.rdSeed();
let accessToken: string = '';
let sessionSecret: string = '';




/**
 * Validates the users login with 2FA
 * @param password 
 * @param token 
 * @returns boolean
 */
function validate2FA(password: string, token: string): boolean {

    try {
        if (!bcrypt.compare(password, hashedPass)) {
            throw new Error("Invalid Password");
        }

        if (!authenticator.verify({token : token, secret : seed})) {
            throw new Error("Invlaid Authentication");
        }

    } catch(e) {
        const err = e as Error;
        console.error(err);
        return false;
    }

    return true;
}

/**
 * Generates a valid json web token
 */
function generateCredential() {
    let webToken = {
        iat: Date.now(),
        exp: Math.floor((Date.now() / 1000) + (60 * 60))
    };
    
    sessionSecret = crypto.randomBytes(32).toString('hex');
    accessToken = jwt.sign(webToken, sessionSecret);
}

/**
 * checks if the provided token is valid
 * @param token 
 * @returns boolean
 */
function validateCredential(token: string): boolean {
    try {

        const decode = jwt.verify(token, sessionSecret);

    } catch(e) {
        const err = e as Error;
        console.error(err);
        return false;
    }

    return true;
}

/**
 * gets the users access token
 * @returns string
 */
function getSessionCredential(): string{
    return accessToken;
}

export default {
    validate2FA,
    generateCredential,
    validateCredential,
    getSessionCredential
    
};