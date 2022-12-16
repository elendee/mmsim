const env = require('../.env.js')
const fs = require('fs')
const log = require('../log.js')
const lib = require('../lib.js')
// const BROKER = require('../EventBroker.js')
const DB = require('./db.js')
const Persistent = require('./Persistent.js')




const EVENTS = [
	'mob_kill', 
	'boss_kill', 
	'player_kill', 
	'loot_treasure',
	'loot_epic',
	'join_guild',
	false,
	false,
	false,
	false,
]


class Player extends Persistent {

	constructor( init ){

		super( init )

		init = init || {}

		this._table = 'players'

		this.name = lib.validate_string( init.name, 'anon_' + lib.random_hex(4))
		this._world_key = lib.validate_number( init._world_key, init.world_key, env.PUBLIC_WORLD_KEY )

	}

	update( world ){
		const event = lib.random_entry( EVENTS )
		if( event ){
			world.broadcast( world._USERS, {
				type: 'player_log',
				data: {
					event_type: event,
					name: this.name,
					uuid: this.uuid,					
				}
			})
		}
	}

	async save(){

		const update_fields = [
			'name',
			'world_key',
		]

		const update_vals = [ 
			this.name,
			this._world_key,
		]	

		const res = await DB.update( this, update_fields, update_vals )
		log('Player', 'SAVED player', lib.identify( this ))

		return res

	}

}

module.exports = Player