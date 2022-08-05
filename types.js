const ENUM = require('./snap/lib-js/enums');

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
 * @property {string} spotyrideLink - link to partner's spotyride page
 */

/**
 * @typedef T_absence
 * @property {EpochTimeStamp} created_at
 * @property {EpochTimeStamp} date_end
 * @property {EpochTimeStamp} date_start
 * @property {EpochTimeStamp} previous_date_end
 * @property {EpochTimeStamp} previous_date_start
 * @property {EpochTimeStamp} updated_at
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
 * @property {string} user_id
 * @property {string} harbour_id
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
 * @property {string} google_map_link
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
 * @property {string} gbbAppId
 * @property {string} gbbApiKey
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
 * @property {Array<string> || string} onesignal_userid
 * @property {boolean} enabled - 1 || 0 is the account ready to be used
 * @property {boolean} show_communication_module
 * @property {boolean} show_reporting_module
 * @property {boolean} show_security_module
 * @property {ENUM.rolesMobileApp} roleMobileApp
 * @property {EpochTimeStamp} created_at 
 * @property {EpochTimeStamp} date - deprec - use created_at or updated_at
 * @property {EpochTimeStamp} updated_at 
 * @property {string || undefined} resetPwdToken - 
 * @property {string} boat_id
 * @property {string} category
 * @property {string} contract_number
 * @property {string} email
 * @property {string} first_name
 * @property {string} harbour_id
 * @property {string} id
 * @property {string} last_name
 * @property {string} password
 * @property {string} phone
 * @property {string} prefix
 * @property {string} prefixed_phone
 * @property {string} token
 * @property {string} username - conform IAS servira de login
 */

/**
 * @typedef T_userFP - users referenced in fortpress user db -> dashboard access
 * @property {EpochTimeStamp} created_at 
 * @property {EpochTimeStamp} updated_at 
 * @property {string} bio
 * @property {string} id
 * @property {string} last_login
 * @property {string} link
 * @property {string} login
 * @property {string} name
 * @property {string} password
 * @property {string} photo
 * @property {string} pw_type
 * @property {string} role - Used by fortpress
 * @property {T_data_userFP} data
 */
/**
 * @typedef T_data_userFP
 * @property {string} type - old role system use only 'harbour_manager' role
 * @property {string} entity_id
 * @property {Array<string>} harbour_id
 * @property {string} roleBackOffice - used for back office access rights
 */

/**
 * @typedef T_communication
 * @property {string} category
 * @property {string} message
 * @property {string} harbour_id
 * @property {string} id
 * @property {string} title
 * @property {string} user_category ['visitor', 'yachtsman', 'all'],
 * @property {string} notification_link
 * @property {string} img
 * @property {string} pjname
 * @property {string} pj
 * @property {string} link_name
 * @property {string} link
 * @property {string} cloudinary_img_public_id
 * @property {string} cloudinary_pj_public_id
 * @property {Array<string>} read_id
 * @property {Array<string>} users_id - don't know what it is !
 * @property {EpochTimeStamp} date - deprec
 * @property {EpochTimeStamp} created_at
 * @property {EpochTimeStamp} updated_at
 */

/**
 * @typedef T_sortie
 * @property {EpochTimeStamp} created_at
 * @property {EpochTimeStamp} datetime_in
 * @property {EpochTimeStamp} datetime_out
 * @property {EpochTimeStamp} deleted_at
 * @property {EpochTimeStamp} edited_at
 * @property {number} duration
 * @property {string} boat_id
 * @property {string} harbour_id
 * @property {string} id
 * @property {string} is_notification_sent
 * @property {string} place_id

/**
 * @typedef T_weather
 * @property {EpochTimeStamp} created_at
 * @property {EpochTimeStamp} date - deprec
 * @property {EpochTimeStamp} updated_at
 * @property {string} cloudinary_img_public_id
 * @property {string} id
 * @property {string} img
 * @property {string} title
 * @property {T_harbour['id']} harbour_id
 */

/**
 * @typedef T_event
 * @property {EpochTimeStamp} date - deprec
 * @property {EpochTimeStamp} created_at - deprec
 * @property {EpochTimeStamp} date_end
 * @property {EpochTimeStamp} date_start
 * @property {string} category
 * @property {string} cloudinary_img_public_id
 * @property {string} content
 * @property {string} description
 * @property {string} harbour_id
 * @property {string} id
 * @property {string} img
 * @property {string} title
 */

/**
 * @typedef T_offer
 * @property {Date} created_at
 * @property {Date} updated_at
 * @property {Date} deleted_at
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} content
 * @property {string} date_start
 * @property {string} date_end
 * @property {string} img
 * @property {string} harbour_id
 */