'use strict';
const f = require("node-fetch")
const rs = require("randomstring");

// based off https://www.npmjs.com/package/mailcow-api
/**
 * For all options check out {@link https://demo.mailcow.email/api/}
 * @typedef Domain
 * @type {Object}
 * @prop {String} domain Name of the domain to add
 * @prop {Number} [active=1] Whether the domain should be active or not
 * @prop {Number} [aliases=400] Number of aliases allowed
 * @prop {Number} [defquota=3072]
 * @prop {Number} [mailboxes=10]
 * @prop {Number} [maxquota=10240]
 * @prop {Number} [quota=10240]
 * @example
 * {
    active: 1,
    domain: "example.com",
    aliases: 400, // responding "object is not numeric" if missing is this a BUG? should be "aliases missing" if cant be omited anyway
    backupmx: 0,
    defquota: 3072,
    description: "Hello!",
    lang: "en",
    mailboxes: 10,
    maxquota: 10240,
    quota: 10240,
    relay_all_recipients: 0,
    rl_frame: "s",
    rl_value: 10
    }
 *
 */


/**
* Object representing a DKIM Key
* @typedef DKIM
* @type {Object}
* @prop {String} domain The domain which a key should be generated for
* @prop {String} [dkim_selector='dkim'] The dkim selector
* @prop {2048|1024} [key_size=2048] The size of the key
* @example
 {
  "domain": "example.com",
  "dkim_selector": "dkim",
  "key_size": 2048
 }
*/

/**
* Object representing a domain admin
* @typedef DomainAdmin
* @type {Object}
* @prop {Array|String} domains The domains/domain this admin should be able to access
* @prop {String} [username=RANDOM]
* @prop {String} [password=RANDOM] 
* @prop {0|1} [active=1]
* @example
 {
  "active": 1,
  "domains": "example.com",
  "password": "supersecurepw",
  "username": "testadmin"
}
*/

/**
 * Object representing a mailbox
 * @typedef Mailbox
 * @type {Object}
 * @prop {String} domain domain for wich the mailbox shall be created
 * @prop {String} [local_part="mail"] the local part of the mail address before the @
 * @prop {String} [name="John Doe"] full name of the user
 * @prop {String} [password=RANDOM] password for the user. if omitted one will be generated
 * @prop {Number} [quota=3072] maximum size of the mailbox
 * @prop {0|1} [active=1] whether the mailbox is active or not
 * @example
 {
  "domain": "example.com",
  "local_part": "john.doe",
  "name": "John Doe",
  "password": "paulIstToll",
  "quota": 3072,
  "active": 1
}
 
 * */




/** @module mailcow-api */
/** 
 * @class Class representing the Mailcow API client 
 *@example 
(async () => {
    //get global variables
    require('dotenv').config();
    
    //import the api client module
    const {
        MailcowApiClient
    } = require("mailcow-api")
    //create new mailcow api client with endpoint/baseurl and the api key
    const mcc = new MailcowApiClient(process.env.MAILCOW_API_BASEURL, process.env.MAILCOW_API_KEY);
    //get all domain on mailcow server
    console.log(await mcc.getDomain());
})();
*/

module.exports.MailcowApiClient = class {
    /**
     * Create a Mailcow API client.
     * @constructor
     * @param {string} baseurl The base url where the api can be found
     * @param {string} apikey The api key for the mailcow api endpoint
     * @example
     * const mcc = new MailcowApiClient(process.env.MAILCOW_API_BASEURL, process.env.MAILCOW_API_KEY);
     */
    constructor(baseurl, apikey) {
        this.baseurl = baseurl;
        this.apikey = apikey;
    }
    /**
     * Gets a specific domain or all domains
     * @param {String} [domain='all'] The domain you want to get
     * @returns {Array} Array of domains
     * @example
     * await mcc.getDomain()
     * */
    async getDomain(domain) {
        if (!domain || !domain.length) domain = "all"
        return f(`${this.baseurl}/api/v1/get/domain/${domain}`, {
            method: 'GET',
            headers: {
                'X-Api-Key': this.apikey
            }
        }).then(async (res) => {
            const j = await res.json().catch();
            if (!j.length) return [j]
            console.error(j);
            return false;
        })
    }
    /**
     * Adds a domain to the server
     * @param {String|Domain} domain The domain you want to add
     * @returns {Boolean} True on success
     * @example
        await mcc.addDomain({
            domain: "example.com",
        }))
     * */
    async addDomain(domain) {
        if (!domain) throw new Error('Missing Domain');
        if (!domain.domain) {
            domain = {
                domain
            };
        }
        if (!domain.domain.match(/[A-Z-a-z0-9]+\.[A-Z-a-z0-9]+$/)) throw new Error('domain name is invalid');

        domain.active = typeof (domain.active) == 'undefined' ? 1 : domain.active;
        domain.aliases = typeof (domain.aliases) == 'undefined' ? 400 : domain.aliases;
        domain.defquota = typeof (domain.defquota) == 'undefined' ? 3072 : domain.defquota;
        domain.mailboxes = typeof (domain.mailboxes) == 'undefined' ? 10 : domain.mailboxes;
        domain.maxquota = typeof (domain.maxquota) == 'undefined' ? 10240 : domain.maxquota;
        domain.quota = typeof (domain.quota) == 'undefined' ? 10240 : domain.quota;

        return f(`${this.baseurl}/api/v1/add/domain`, {
            method: 'POST',
            headers: {
                'X-Api-Key': this.apikey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(domain)
        }).then(async (res) => {
            const j = await res.json().catch();
            if (j[0].type === 'success') return true;
            console.error(j);
            return false;
        });
    }
    /**
     * Edits one or more domains on the server. Applies the attributes to all domains provided.
     * @param {Array|String} domains The domains you want to edit
     * @param {Object} attributes Attributes to change for all domains provided domains
     * @returns {Boolean} True on success
     * @example
        await mcc.editDomain(["example.com"], {
            aliases: 399
        });
        //This will set the aliases of example.com to 399
     */
    async editDomain(domains, attributes) {
        if (typeof domains === 'string') domains = [domains];
        const body = {
            items: domains,
            attr: attributes
        }
        return f(`${this.baseurl}/api/v1/edit/domain`, {
            method: 'POST',
            headers: {
                'X-Api-Key': this.apikey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }).then(async (res) => {
            const j = await res.json().catch();
            if (j[0].type === 'success') return true;
            console.error(j);
            return false;
        });
    }
    /**
     * Removes a domain from the server
     * @param {String|Array} domain The domain/domains you want to delete
     * @returns {Boolean} True on success
     * @example
        await mcc.deleteDomain("example.com")
     * */
    async deleteDomain(domain) {
        if (!Array.isArray(domain)) domain = [domain]

        return f(`${this.baseurl}/api/v1/delete/domain`, {
            method: 'POST',
            headers: {
                'X-Api-Key': this.apikey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(domain)
        }).then(async (res) => {
            const j = await res.json().catch();
            if (j[0].type === 'success') return true;
            console.error(j);
            return false;
        });
    }
    /**
     * Generates a DKIM domain key for a domain
     * @param {String|DKIM} dkim A DKIM object or string 
     * @returns {Boolean} True on success
     * @example
        await mcc.addDKIM({
            domain: "example.com",
        })
        //This will generate a DKIM key for example.com on the mailcow server
     */
    async addDKIM(dkim) {
        if (!dkim.domain) {
            dkim = {
                domains: dkim
            };
        } else {
            dkim.domains = dkim.domain;
        }

        if (!dkim) throw new Error('DKIM Key must be provided as DKIM Object');
        if (!dkim.domains) throw new Error('DKIM object must contain a domain name. Example: {domains:"example.com"}');
        if (!dkim.domains.match(/[A-Z-a-z0-9]+\.[A-Z-a-z0-9]+$/)) throw new Error('domain name is invalid');

        dkim.dkim_selector = typeof (dkim.dkim_selector) == 'undefined' ? 'dkim' : dkim.dkim_selector;
        dkim.key_size = typeof (dkim.key_size) == 'undefined' ? 2048 : dkim.key_size;

        return f(`${this.baseurl}/api/v1/add/dkim`, {
            method: 'POST',
            headers: {
                'X-Api-Key': this.apikey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dkim)
        }).then(async (res) => {
            const j = await res.json().catch();
            if (j && j[0] && j[0].type === 'success') return true;
            console.error(j);
            return false;
        });
    }
    /**
     * Gets the DKIM key for a domain on the mailcow server
     * @param {String} domain the domain name you want to get the key for
     * @returns {Object} The DKIM public key and other parameters
     * @example
        await mcc.getDKIM('example.com')
        //This will get the DKIM key for the domain example.com from the mailcow server
     */
    async getDKIM(domain) {
        return f(`${this.baseurl}/api/v1/get/dkim/${domain}`, {
            method: 'GET',
            headers: {
                'X-Api-Key': this.apikey
            }
        }).then(async (res) => {
            const j = await res.json().catch();
            if (j.pubkey) return j;
            return false;
        });
    }
    /**
     * Deletes the DKIM key for a domain on the mailcow server
     * @param {Array} domain the domain name/names you want to delete the key for
     * @returns {Boolean} true on success 
     * @example
        await mcc.deleteDKIM('example.com')
        //This will delete the DKIM key for the domain example.com from the mailcow server
     */
    async deleteDKIM(domain) {
        if (!Array.isArray(domain)) domain = [domain]
        return f(`${this.baseurl}/api/v1/delete/dkim/`, {
            method: 'POST',
            headers: {
                'X-Api-Key': this.apikey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(domain)
        }).then(async (res) => {
            const j = await res.json().catch();
            if (j && j[0] && j[0].type === 'success') return true;
            console.error(j);
            return false;
        });
    }
    /**
     * Generates a DKIM domain key for a domain and returns it
     * @param {String|DKIM} dkim A DKIM object or string
     * @returns {Object} DKIM key on success
     * @example
        await mcc.addAndGetDKIM({
            domain: "example.com",
        })
        //This will generate a DKIM key for example.com on the mailcow server and return it
     */
    async addAndGetDKIM(dkim) {
        if (!dkim.domain) {
            dkim = {
                domain: dkim
            };
        }
        const res = await this.getDKIM(dkim.domain);
        if (res) return res;
        await this.addDKIM(dkim);
        return await this.getDKIM(dkim.domain);
    }
    /**
     * Adds a domain admin to the mailcow server
     * @param {DomainAdmin} domainAdmin a domain admin object that has to contain at least the domains the admin should be able to control
     * @returns {Object} containing password username and domains on successfull creation
     * @example
        await mcc.addDomainAdmin({
            domains: ['example.com', 'example.org']
        })
        //This will add an admin for the domains example.com and example.org and return their credentials
     */
    async addDomainAdmin(domainAdmin) {
        if (!domainAdmin) throw new Error('Domain admin must be provided as DomainAdmin Object');
        if (!domainAdmin.domains) throw new Error('Domain admin object must contain a domain name. Example: {domains:"example.com"}');
        if (typeof domainAdmin.domains === 'string') domainAdmin.domains = [domainAdmin.domains];
        if (!domainAdmin.domains[0].match(/[A-Z-a-z0-9]+\.[A-Z-a-z0-9]+$/)) throw new Error('domain name is invalid');

        domainAdmin.active = typeof (domainAdmin.active) == 'undefined' ? 1 : domainAdmin.active;
        domainAdmin.password = typeof (domainAdmin.password) == 'undefined' ? rs.generate(100) : domainAdmin.password;
        domainAdmin.username = typeof (domainAdmin.username) == 'undefined' ? "domain_admin_" + rs.generate(20) : domainAdmin.username;
        domainAdmin.password2 = domainAdmin.password;

        return f(`${this.baseurl}/api/v1/add/domain-admin`, {
            method: 'POST',
            headers: {
                'X-Api-Key': this.apikey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(domainAdmin)
        }).then(async (res) => {
            const j = await res.json().catch();
            if (j && j[0] && j[0].type === 'success') return {
                username: domainAdmin.username,
                password: domainAdmin.password,
                domains: domainAdmin.domains
            };
            console.error(j);
            return false;
        });

    }
    /**
     * Adds a mailbox for a domain to the mailcow server
     * @param {Mailbox} mailbox a Mailbox object that has to contain at least the domain for which the mailbox shall be created
     * @returns {Object} the created mailbox
     * @example
        await mcc.addMailbox({
            domain: 'example.com',
            name: 'Example'
        })
        //This will add a mailbox for the domain example.com and return it 
     */
    async addMailbox(mailbox) {
        if (!mailbox) throw new Error('Mailbox must be provided as Mailbox Object');
        if (!mailbox.domain) throw new Error('Mailbox object must at least contain a domain name. Example: {domain:"example.com"}');
        if (!mailbox.domain.match(/[A-Z-a-z0-9]+\.[A-Z-a-z0-9]+$/)) throw new Error('domain name is invalid');

        mailbox.active = typeof (mailbox.active) == 'undefined' ? 1 : mailbox.active;
        mailbox.password = typeof (mailbox.password) == 'undefined' ? rs.generate(100) : mailbox.password;
        mailbox.password2 = mailbox.password;
        mailbox.quota = typeof (mailbox.quota) == 'undefined' ? 3072 : mailbox.quota;
        mailbox.name = typeof (mailbox.name) == 'undefined' ? 'John Doe' : mailbox.name;
        mailbox.local_part = typeof (mailbox.local_part) == 'undefined' ? 'mail' : mailbox.local_part;

        return f(`${this.baseurl}/api/v1/add/mailbox`, {
            method: 'POST',
            headers: {
                'X-Api-Key': this.apikey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(mailbox)
        }).then(async (res) => {
            const j = await res.json().catch();
            if (j && j[0] && j[0].type === 'success') return {
                username: mailbox.local_part + '@' + mailbox.domain,
                password: mailbox.password,
                domain: mailbox.domain,
                name: mailbox.name,
                local_part: mailbox.local_part,
                quota: mailbox.quota
            };
            console.error(j);
            return false;
        });
    }
    /**
     * Deletes a mailbox 
     * @param {String|Array} mailboxes complete name of the mailbox/mailboxes
     * @returns {Boolean} true on success
     * @example
        await mcc.deleteMailbox("mail@example.com")
        //This will delete the mailbox mail@example.com
     */
    async deleteMailbox(mailboxes) {
        if (typeof mailboxes === 'string') mailboxes = [mailboxes];
        if (!mailboxes[0].match(/[A-Z-a-z0-9]+\.[A-Z-a-z0-9]+$/)) throw new Error('domain name is invalid');

        return f(`${this.baseurl}/api/v1/delete/mailbox`, {
            method: 'POST',
            headers: {
                'X-Api-Key': this.apikey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(mailboxes)
        }).then(async (res) => {
            const j = await res.json().catch();
            if (j && j[0] && j[0].type === 'success') return true;
            console.error(j);
            return false;
        });
    }
    /**
     * Adds an alias for a mailbox 
     * @param {String} address alias address, for catchall use "@domain.tld"
     * @param {String} goto destination address, comma separated
     * @returns {Boolean} true on success
     * @example
        await mcc.addAlias("@test.tld","mail@example.com")
        //This will catch all mail for the domain test.tld and put it in the mailbox mail@example.com
     */
    async addAlias(address, goto) {
        return f(`${this.baseurl}/api/v1/add/alias`, {
            method: 'POST',
            headers: {
                'X-Api-Key': this.apikey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                address,
                goto,
                active: "1"
            })
        }).then(async (res) => {
            const j = await res.json().catch();
            if (j && j[0] && j[0].type === 'success') return true;
            console.error(j);
            return false;
        });
    }

    async getUser(user) {
        if (!user || !user.length) user = "all"
        // user should be user@domain.tld
        return f(`${this.baseurl}/api/v1/get/mailbox/${user}`, {
            method: 'GET',
            headers: {
                'X-Api-Key': this.apikey
            }
        }).then(async (res) => {
            const j = await res.json().catch();
            if (!j.length) return [j]
            console.error(j);
            return false;
        })
    }

}