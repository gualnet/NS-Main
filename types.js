/**
 * @typedef qrcode
 * @property {string} id
 * @property {string} title - name of the port
 * @property {string} apple - link to iOS app, not used anymore
 * @property {string} android - link to android app, not used anymore
 * @property {string} appLink - link to PWA app
 * @property {number} createdAt - timestamp 
 * @property {number} updatedAt - timestamp 
 */

/**
 * @typedef T_partner
 * @property {string} id
 * @property {string} harbour_id
 * @property {string} name
 * @property {string} category
 * @property {string} subcategory
 * @property {string} prefix
 * @property {string} phone
 * @property {string} address
 * @property {string} img
 * @property {string} description
 * @property {number} date
 * @property {string} prefixed_phone
 * @property {string} cloudinary_img_public_id
 */

/**
 * @typedef T_absence
 * @property {string} id
 * @property {string} user_id
 * @property {string} boat_id
 * @property {string} date_start
 * @property {string} date_end
 * @property {string} token
 * @property {string} harbour_id
 * @property {number} date - OLD DATE TO BE REMOVED
 * @property {number} created_at - timestamp
 * @property {number} updated_at - timestamp
 */

/**
 * @typedef T_boat
 * @property {string} id
 * @property {string} place
 * @property {string} name
 * @property {string} immatriculation
 * @property {string} is_resident
 * @property {string} user
 * @property {string} harbour
 * @property {number} date
 */