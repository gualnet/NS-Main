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

/**
 * @typedef T_place
 * @property {string} id
 * @property {string} harbour_id
 * @property {string} number
 * @property {string} captorNumber
 * @property {string} pontonId
 * @property {number} longueur
 * @property {number} largeur
 * @property {number} tirantDeau
 * @property {string} type
 * @property {number} nbTramesDepart
 * @property {number} nbTramesRetour
 * @property {number} maxSeuil
 * @property {number} minSeuil
 * @property {string} occupation
 * @property {number} status
 */

/**
 * @typedef T_harbour
 * @property {EpochTimeStamp} date
 * @property {string} address
 * @property {string} buoy
 * @property {string} cloudinary_harbour_map_public_id
 * @property {string} cloudinary_img_public_id
 * @property {string} cloudinary_price_list_public_id
 * @property {string} electricity
 * @property {string} email
 * @property {string} email_concierge
 * @property {string} erp_link
 * @property {string} fuel
 * @property {string} harbour_map
 * @property {string} hours
 * @property {string} id
 * @property {string} id_entity
 * @property {string} img
 * @property {string} latitude
 * @property {string} longitude
 * @property {string} longmax
 * @property {string} name
 * @property {string} phone
 * @property {string} phone_urgency
 * @property {string} place
 * @property {string} places
 * @property {string} prefix
 * @property {string} prefix_urgency
 * @property {string} prefixed_phone
 * @property {string} prefixed_phone_urgency
 * @property {string} price_list
 * @property {string} sanitary_code
 * @property {string} showers
 * @property {string} technical_informations
 * @property {string} tirantdeau
 * @property {string} toilet
 * @property {string} touristwebsite
 * @property {string} vfh
 * @property {string} water
 * @property {string} website
 * @property {string} wifi
 * @property {string} wifi_pass
 * @property {string} lundi
 * @property {string} mardi
 * @property {string} mercredi
 * @property {string} jeudi
 * @property {string} vendredi
 * @property {string} samedi
 * @property {string} dimanche
 */