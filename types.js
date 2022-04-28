
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
 * @property {EpochTimeStamp} created_at
 * @property {EpochTimeStamp} date_end
 * @property {EpochTimeStamp} date_start
 * @property {EpochTimeStamp} previous_date_end
 * @property {EpochTimeStamp} previous_date_start
 * @property {EpochTimeStamp} updated_at
 * @property {number} date - Deprec, use created_at instead
 * @property {string} boat_id
 * @property {string} harbour_id
 * @property {string} id
 * @property {string} token
 * @property {string} user_id
 */

/**
 * @typedef T_boat
 * @property {string} id
 * @property {string} place_id
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

const incidentsTypes = require('./snap/lib-js/enums').incidentsTypes;
/**
 * @typedef T_harbour
 * @property {Array<incidentsTypes>} incidentTypesEnabled - contain the incident types that are enabled for the harbour users - see ENUM.incidentTypes
 * @property {EpochTimeStamp} date
 * @property {string} address
 * @property {string} buoy
 * @property {string} cloudinary_harbour_map_public_id
 * @property {string} cloudinary_img_public_id
 * @property {string} cloudinary_price_list_public_id
 * @property {string} dimanche
 * @property {string} electricity
 * @property {string} email
 * @property {string} email_concierge
 * @property {string} email_incident
 * @property {string} erp_link
 * @property {string} fuel
 * @property {string} harbour_map
 * @property {string} hours
 * @property {string} id
 * @property {string} id_entity
 * @property {string} img
 * @property {string} jeudi
 * @property {string} latitude
 * @property {string} longitude
 * @property {string} longmax
 * @property {string} lundi
 * @property {string} mardi
 * @property {string} mercredi
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
 * @property {string} samedi
 * @property {string} sanitary_code
 * @property {string} showers
 * @property {string} technical_informations
 * @property {string} tirantdeau
 * @property {string} toilet
 * @property {string} touristwebsite
 * @property {string} vendredi
 * @property {string} vfh
 * @property {string} water
 * @property {string} website
 * @property {string} wifi
 * @property {string} wifi_pass
 */

/**
 * @typedef T_entity
 * @property {boolean} absence_module
 * @property {string} address
 * @property {boolean} challenges_module
 * @property {string} cloudinary_img_public_id
 * @property {EpochTimeStamp} date
 * @property {string} email
 * @property {string} id
 * @property {string} img
 * @property {string} logo
 * @property {string} appIcon - Link to the app icon, supposed to be a png file stored on cloudinary
 * @property {string} mailjet_apikey
 * @property {string} mailjet_secretkey
 * @property {string} maree_id
 * @property {boolean} marees_module
 * @property {string} name
 * @property {string} onesignal_app_id
 * @property {string} onesignal_auth
 * @property {string} phone
 * @property {string} prefix
 * @property {string} prefixed_phone
 * @property {boolean} security_module
 * @property {string} weather_api
 * @property {string} wlink_vone_pw
 * @property {string} wlink_vone_token
 * @property {string} wlink_vone_user
 * @property {string} wlink_vtwo_apikey
 * @property {string} wlink_vtwo_secretkey
 */

/**
 * @typedef T_zone
 * @property {string} id
 * @property {string} harbour_id
 * @property {string} name
 * @property {string} type
 */

/**
 * @typedef T_incident
 * @property {EpochTimeStamp} date - deprec
 * @property {EpochTimeStamp} created_at
 * @property {EpochTimeStamp} updated_at
 * @property {EpochTimeStamp} date_start
 * @property {EpochTimeStamp} date_end
 * @property {string} description
 * @property {string} harbour_id
 * @property {string} id
 * @property {string} status
 * @property {string} token
 * @property {string} user_id
 * @property {string} zone
 * @property {string} type - one of incidentsTypes enum
 */

/**
 * @typedef T_erpUser
 * @property {string} id
 * @property {string} name
 * @property {Array<T_harbour>} harbourIds - list of harbour id, port access list
 * @property {string} apiToken
 * @property {string} role - ERP
 * @property {EpochTimeStamp} created_at 
 * @property {EpochTimeStamp} updated_at 
 */

/**
 * @typedef T_user - users referenced in nauticspot user db -> mobile app access
 * @property {EpochTimeStamp} date
 * @property {string} category
 * @property {string} contract_number
 * @property {string} email
 * @property {string} first_name
 * @property {string} harbourid
 * @property {string} id
 * @property {string} last_name
 * @property {string} password
 * @property {string} phone
 * @property {string} prefix
 * @property {string} prefixed_phone
 * @property {string} token
 * @property {import('./snap/lib-js/enums').rolesBackOffice} roleBackOffice
 * @property {import('./snap/lib-js/enums').rolesMobileApp} roleMobileApp
 */

/**
 * @typedef T_userFP - users referenced in fortpress user db -> dashboard access
 * @property {string} id
 * @property {string} login
 * @property {string} pw_type
 * @property {string} password
 * @property {string} name
 * @property {string} bio
 * @property {string} role
 * @property {string} data
 * @property {string} link
 * @property {string} last_login
 * @property {string} photo
 */
