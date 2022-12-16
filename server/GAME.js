const env = require('./.env.js')
const lib = require('./lib.js')
const log = require('./log.js')
const DB = require('./persistent/db.js')
const ROUTER = require('./ROUTER.js')
const World = require('./persistent/World.js')



class Game {
	constructor(init){
		init = init || {}
		this._WORLDS = {}
		this._intervals = {
			watcher: false,
		}
	}

	isActive(){
		return !!this._online
	}

	async initialize(){
		// watcher
		if( !this._intervals.watcher ){
			this._intervals.watcher = setInterval(() => {
				for( const uuid in this._WORLDS ){
					if( !Object.keys( this._WORLDS[ uuid]._PLAYERS ) ){
						this.remove_world( uuid )
					}
				}
			}, 1000)
		}

		this._online = true
	}

	async init_user( socket ){
		// user
		const user = socket.request.session?.USER
		if( !user ) throw new Error( 'invalid user for init')
		// world
		const world = await this.touch_world( false, user._world_key )
		if( !world ) throw new Error('invalid user world key', user._world_key )

		ROUTER.bind_user( socket, this )

		await world.bring_online()

		await world.add_user( user )

		world.send_init( user )

	}

	async touch_world( uuid, id ){
		if( uuid ) throw new Error('unhandled world uuid lookup......')
		if( !id ) throw new Error('no id provided for world lookup')
		// in memory already
		for( const uuid in this._WORLDS ){
			if( this._WORLDS[uuid]._id === id ){
				return this._WORLDS[uuid]
			}
		}
		// need from server
		const pool = DB.getPool()
		const sql = `SELECT * FROM worlds WHERE id=?`
		const res = await pool.queryPromise( sql, id )
		if( res.results?.length ){
			return new World( res.results[0] )
		}
		throw new Error('unable to initialize world')
	}

	async add_world( world ){
		if( !world?.uuid ) return log('flag','invalid add world: ', world )
		this._WORLDS[ world.uuid ] = world

	}

	async remove_world( uuid ){
		const world = this._WORLDS[uuid]
		if( !world ) return log('flag','world is already closed', uuid )
		await world.close()
		//
	}

}


const game = new Game()


module.exports = game