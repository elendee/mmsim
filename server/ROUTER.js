const log = require('./log.js')
const env = require('./.env.js')
const lib = require('./lib.js')
const BROKER = require('./EventBroker.js')






const router = {

	bind_user: ( socket, GAME ) => { 

		let packet, ROOM

		const USER = socket.request.session?.USER
		if( !USER ) return log('flag','no user found at router.bind')

		USER._socket = socket

		socket.on('message',  ( data ) => {

			try{ 

				packet = lib.sanitize_packet( JSON.parse( data ) )
				ROOM = GAME.ROOMS?.[ USER._room_uuid ]
				if( !ROOM ){
					log('flag', 'invalid player room uuid: ', USER._room_uuid )
					// log('flag', 'missed packet: ', packet.type )
					// for( const uuid in GAME.ROOMS ){
					// 	log('flag', 'available system: ', lib.identify( GAME.ROOMS[ uuid ] ) )
					// }
					return false
				}

				switch( packet.type ){

					// 

					default: 
						log('flag', 'unhandled action: ', packet )
						break;
				}

			}catch( err ){
				if( err.message.match(/unexpected token/i)){
					log('flag', 'packet parse err' ) 
				}else{
					log('flag', 'packet err', err )
				}
			}

		})

		socket.on('error', ( data ) => {
			log('flag', 'socket error: ', data )
		})

		socket.on('close', ( data ) => {
			log('registry', 'socket close purge', lib.identify( USER ))
			if( USER._cooldown ){
				log('flag', 'ending user _cooldown')
				USER.set_cooldown( false )
			}else{
				log('flag', 'user did not have _cooldown')
			}
			BROKER.publish('GAME_PURGE', { socket: socket })
			// GAME.purge( socket )
		})

	}

}


module.exports = router
