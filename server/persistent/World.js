const env = require('../.env.js')
const lib = require('../lib.js')
const log = require('../log.js')
const DB = require('./db.js')
const Player = require('../persistent/Player.js')
const Persistent = require('../persistent/Persistent.js')


class World extends Persistent {

	constructor(init){
		super( init )
		init = init || {}
		this._table = 'worlds'
		this.name = lib.validate_string( init.name, 'unknown world' )
		this.description = lib.validate_string( this.description, 'Not much is known about ' + this.name )
		this._WORLDS = {}
		this._intervals = {
			players: false,
			npcs: false,
			social_media: false,
			guilds: false,
		}

		this._USERS = {} // actual people

		this._PLAYERS = {} // simulated people
		this._NPCS = {} // simuilated npcs

		lib.add_publish( this )
	}

	isActive(){
		return !!this._online
	}

	async bring_online(){

		if( this._online ) return 

		this.init_intervals()

		this.get_players()
		.then( res => {
			// fill on first load:
			if( res?.results?.length ){

				for( const r of res.results ){
					this.add_player( new Player( r ) )
				}

			}else if( env.FILL_WORLD_PLAYERS ){

				log('flag', 'filling world players: ', this.name )
				this.fill_players()
				.then( response => {
					this.get_players()
					.then( res => {
						log('flag', 'why?', res )
						for( const r of res.results ){
							this.add_player( new Player( r ) )
						}			
					})
				})

			}

		})

		this._online = true

	}

	async fill_players(){
		const r = await new Promise((resolve, reject) => {
			let c = 0
			for( let i = 0; i < 10; i++ ){
				const player = new Player({
					world_key: this._id,
				})
				player.save()
				.then( r => {
					c++
					if( c === 10 ) resolve()
				})
				.catch( err => {
					log('flag', 'err initalizing player', err )
					c++
					if( c === 10 ) resolve()
				})
			}
		})
		return r
	}

	add_player( player ){
		this._PLAYERS[player.uuid] = player
	}

	async get_players(){
		const pool = DB.getPool()
		const sql = `SELECT * FROM players WHERE world_key=?`
		const res = await pool.queryPromise( sql, this._id )
		return {
			success: true,
			results: res.results,
		}
	}

	broadcast( group, packet ){
		for( const uuid in group ){
			const socket = group[uuid]._socket
			if( socket ){
				socket.send( JSON.stringify( packet ) )
			}
		}
	}

	init_intervals(){
		// players
		if( !this._intervals.players ){
			this._intervals.players = setInterval(() => {
				for( const uuid in this._PLAYERS ){
					this._PLAYERS[uuid].update( this )
				}
			}, 1000)
		}
		// npcs
		if( !this._intervals.npcs ){
			this._intervals.npcs = setInterval(() => {
				for( const uuid in this._NPCS ){
					this._NPCS[uuid].update( this )
				}
			}, 1000)
		}
		// guilds
		if( !this._intervals.guilds ){
			this._intervals.guilds = setInterval(() => {
				for( const uuid in this._GUILDS ){
					this._GUILDS[uuid].update( this )
				}
			}, 1000)
		}
		// social_media
		if( !this._intervals.social_media ){
			this._intervals.social_media = setInterval(() => {
				this.update_social_media()
			}, 1000)
		}
	}

	send_init( user ){
		if( !user._socket ) throw new Error('no user socket')
		user._socket.send( JSON.stringify({
			type: 'init_world',
			world: this.publish()
		}))
	}






	update_social_media(){
		// log('flag', 'skipping socials..')
	}








	async add_user( user ){
		if( !user.uuid ) throw new Error('invalid user to add world')
		this._USERS[ user.uuid ] = user
	}

	async close(){
		// intervals
		for( const key in this._intervals ){
			clearInterval( this._intervals[key])
			delete this._intervals[key]
		}
		// players
		for( const uuid in this._PLAYERS ){
			this._PLAYERS[uuid]._socket.terminate()
		}
	}



	async save(){

		if( typeof this.slug !== 'string' || !this.slug.match(/#/) ){
			log('flag', '--SAVED INVALID USER--', this.handle, this.slug, this.email.substr(0,6) + '...' )
		}

		const update_fields = [
			'name',
			'description',
		]

		const update_vals = [ 
			this.name,
			this.description,
		]

		// log('User', 'SAVING user')
		const res = await DB.update( this, update_fields, update_vals )
		log('User', 'SAVED user', lib.identify( this ))

		return res

	}



}


module.exports = World