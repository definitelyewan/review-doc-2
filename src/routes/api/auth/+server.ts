
import { json, error } from '@sveltejs/kit';
import security from '$lib/server/security.js';


export async function POST ({ request, url }) {
    /*
    * validate the request
    */

    const bodyContent = await request.json();

    try {

        if (!bodyContent?.password) {
            throw new Error("Missing 2FA information");
        }

        if (!bodyContent?.token) {
            throw new Error("Missing 2FA information");
        }

        let valid: boolean = security.validate2FA(bodyContent.password, bodyContent.token);

        if (!valid) {
            throw new Error("Failed to log in");
        }

    } catch (e) {
        const err = e as Error;
        console.error(err);
        error(400, 'Authorization not provided because: ' + err );
    }

    // if 2fa is successfull generate an access token
    try {

        security.generateCredential();

        let tokenTest = security.getSessionCredential();

        if (!security.validateCredential(tokenTest)) {
            throw new Error("Credential cannot be verified");
        }

    } catch (e) {
        const err = e as Error;
        console.error(err);
        error(400, 'Access credential not generated because: ' + err );
    }

    return json({ token : security.getSessionCredential() }, {status: 200});
};