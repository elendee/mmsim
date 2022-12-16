const log = require('../log.js');
const DB = require('./db.js');
const lib = require('../lib.js');

const uuid = require('uuid').v4


class Persistent {

	constructor( init ){

		init = init || {}

		this._id = lib.validate_number( init.id, init._id, undefined )
		this.uuid = lib.validate_string( init.uuid, uuid() )
		// this.provisional = init.provisional

		this._created = lib.validate_number( init._created, init.created, undefined )
		this._edited = lib.validate_number( init._edited, init.edited, undefined )

		this._deleted = init._deleted // flag for in-app garbage collection / mem management

	}

	is_hydrated(){

		console.log('err: do not execute is_hydrated, only test exists')

	}


	publish( ...excepted ){
		const entity = this

		excepted = excepted || []
		let r = {}
		for( const key of Object.keys( entity )){
			if( ( typeof( key ) === 'string' && key[0] !== '_' ) || excepted.includes( key ) ){
				if( entity[ key ] && typeof entity[ key ].publish === 'function' ){
					// r[ key ] = entity[ key ].publish( ...excepted ) // on 2nd thought... do not pass exceptions beyond 1st scope...
					r[ key ] = entity[ key ].publish()
				}else{
					if( key === '_box'){ // special case.. 
						r._box = { 
							position: entity._box.position,
							scale: entity._box.scale,
							rotation: entity._box.rotation,
						}
					}else{
						r[ key ] = entity[ key ]
					}
				}
			}
		}

		return r

	}

	async unset(){
		log('flag', 'scry uses .delete()')
	}

	async delete(){

		if( !this._table || typeof this._id !== 'number' ) return lib.return_fail({
			msg: 'invalid delete',
			obj: this,
		})

		const pool = DB.getPool()
		const sql = 'DELETE FROM ' + this._table + ' WHERE id=?'
		const res = await pool.queryPromise( sql, this._id )
		if( res.error ) return lib.return_fail( res.error, 'error deleting' )

		return {
			success: true,
		}

	}


}



module.exports = Persistent

