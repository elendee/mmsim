const env = require('../.env.js')
const fs = require('fs')
const log = require('../log.js')
const lib = require('../lib.js')
const BROKER = require('../EventBroker.js')
const DB = require('./db.js')
const Persistent = require('./Persistent.js')


class User extends Persistent {

	constructor( init ){

		super( init )

		init = init || {}

		this._table = 'users'

		// this._oauth_discord = lib.validate_string( init._oauth_discord, init.oauth_discord, undefined )
		// this._oauth_token = lib.validate_string( init._oauth_token, init.oauth_token, undefined )

		this.handle = init.handle || lib.random_hex(6)
		this.slug = init.slug || this.handle + '#' + lib.random_hex( 4 )
		// 'user#' + lib.random_hex(4)

		this._email = lib.validate_string( init.email, init._email, undefined )
		this._password = lib.validate_string( init._password, init.password, undefined )

		this._confirmed = init._confirmed || init.confirmed || false
		this._confirm_code = lib.validate_string( init.confirm_code, init._confirm_code, undefined )
		this._reset_time = lib.validate_number( init.reset_time, init._reset_time, undefined )
		this._last_log = lib.validate_string( init.last_log, init._last_log, undefined )

		this._points = lib.validate_number( init._points, init.points, 0 )

		this._world_key = init._world_key || init.world_key || env.PUBLIC_WORLD_KEY

		// instantiated 
		this._socket = false

	}




	async save(){

		if( typeof this.slug !== 'string' || !this.slug.match(/#/) ){
			log('flag', '--SAVED INVALID USER--', this.handle, this.slug, this.email.substr(0,6) + '...' )
		}

		const update_fields = [
			'handle',
			'slug',
			'email',
			'password',
			'confirmed',
			'confirm_code',
			'reset_time',
			'last_log',
			'points',
			'world_key',
		]

		const update_vals = [ 
			this.handle,
			this.slug,
			this._email,
			this._password,
			this._confirmed,
			this._confirm_code,
			this._reset_time,
			this._last_log,
			this._points,
			this._world_key,
		]

		// log('User', 'SAVING user')
		const res = await DB.update( this, update_fields, update_vals )
		log('User', 'SAVED user', lib.identify( this ))

		return res

	}



}

  
module.exports = User
