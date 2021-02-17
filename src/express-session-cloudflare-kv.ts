import session, { Store } from "express-session";

export { Store } from "express-session";
// @ts-expect-error: no type
import KvStorage from "cloudflare-kv-storage-rest";
// @ts-ignore
import fetch from "node-fetch";
import FormData from "form-data";
import type { KVNamespace } from "./KVNamespace";

type CloudflareWorkersKVStoreOptions = {
    expiration?: number;
    expirationTtl?: number;
};

export class CloudflareWorkersKVStore extends Store {
    constructor(private kvStorage: KVNamespace, private options: CloudflareWorkersKVStoreOptions) {
        super();
    }

    destroy(sid: string, callback?: (err?: any) => void): void {
        this.kvStorage
            .delete(sid)
            .then(() => {
                callback?.();
            })
            .catch((error: any) => {
                callback?.(error);
            });
    }

    get(sid: string, callback: (err: any, session?: session.SessionData | null) => void): void {
        this.kvStorage
            .get(sid)
            .then((session) => {
                if (!session) {
                    return callback(null, null);
                }
                try {
                    const sessionData = JSON.parse(session);
                    callback(null, sessionData);
                } catch (error) {
                    callback(error);
                }
            })
            .catch((error: any) => {
                console.log("error", error);
                callback?.(error);
            });
    }

    set(sid: string, session: session.SessionData, callback?: (err?: any) => void): void {
        this.kvStorage
            .put(sid, JSON.stringify(session), {
                expiration: this.options.expiration,
                expirationTtl: this.options.expirationTtl
            })
            .then(() => {
                callback?.();
            })
            .catch((error: any) => {
                callback?.(error);
            });
    }
}

export type CreateSessionOptions = {
    // cloudflare account id
    accountId: string;
    // KV storage namespace Id
    namespace: string;
    // cloudflare account email
    authEmail: string;
    // cloudflare Global API Key
    authKey: string;
    // https://developers.cloudflare.com/workers/runtime-apis/kv#expiring-keys
    // Set its "expiration", using an absolute time specified in a number of seconds since the UNIX epoch
    expiration?: number;
    // Set its "expiration TTL" (time to live), using a relative number of seconds from the current time. For example, if you wanted a key to expire 10 minutes after creating it, you would set its expiration TTL to 600.
    expirationTtl?: number;
};
export const createSessionStore = (options: CreateSessionOptions) => {
    const kvStorage = new KvStorage({
        namespace: options.namespace,
        accountId: options.accountId,
        authEmail: options.authEmail,
        authKey: options.authKey,
        fetch,
        FormData
    }) as KVNamespace;
    return new CloudflareWorkersKVStore(kvStorage, {
        expiration: options.expiration,
        expirationTtl: options.expirationTtl
    });
};
