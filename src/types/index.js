/**
 * @typedef {'RIVER'|'LAKE'|'SEA'} SpotType
 * @typedef {'Facile'|'Intermédiaire'|'Sportif'} Difficulty
 *
 * @typedef {Object} Spot
 * @property {number}   id
 * @property {string}   name
 * @property {string}   river
 * @property {string}   region
 * @property {string}   country      - ISO 2-letter code
 * @property {SpotType} type
 * @property {string}   distance
 * @property {string}   duration
 * @property {Difficulty} difficulty
 * @property {string[]} activities
 * @property {string}   [description]
 * @property {[number,number]} coords
 * @property {string}   color
 * @property {string}   emoji
 * @property {boolean}  open
 * @property {boolean}  [camping]
 * @property {boolean}  [waterPoints]
 * @property {string}   [sponsored]
 * @property {string}   [unsplash_id]
 * @property {number}   [rating]
 *
 * @typedef {Object} Review
 * @property {string} id
 * @property {number} route_id
 * @property {string} user_id
 * @property {number} rating
 * @property {string} comment
 * @property {string} user_name
 * @property {string} created_at
 *
 * @typedef {Object} UserProfile
 * @property {string}  id
 * @property {string}  username
 * @property {string}  [avatar_url]
 * @property {boolean} [is_admin]
 * @property {boolean} [is_premium]
 *
 * @typedef {Object} Provider
 * @property {string}   id
 * @property {string}   name
 * @property {string}   type
 * @property {string}   country
 * @property {string}   region
 * @property {string}   river
 * @property {string}   description
 * @property {number}   price
 * @property {string}   currency
 * @property {string}   priceLabel
 * @property {number}   rating
 * @property {number}   reviews
 * @property {string[]} activities
 * @property {boolean}  available
 * @property {string}   emoji
 * @property {string[]} badges
 * @property {number}   commission
 * @property {number[]} routeIds
 * @property {string[]} inclut
 * @property {boolean}  eco
 *
 * @typedef {Object} Weather
 * @property {number} temp
 * @property {string} desc
 * @property {number} windKmh
 * @property {number} rain
 * @property {string} icon
 * @property {'good'|'med'|'bad'} s
 * @property {string} l
 * @property {string} col
 */
