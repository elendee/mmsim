import ui from '../ui.js?v=1'
import env from '../env.js?v=1'
import hal from '../inc/ui/hal.js?v=1'
import BROKER from '../EventBroker.js?v=1'




let bound = 0
let packet, SOCKET 


// const key = localStorage.getItem('EVENT-WATCH-KEY')

// if( key === env.EVENT_WATCH_KEY ) begin_watch()
let sent

const init = () => {

	if( sent ) return console.log('already initted')
	sent = true

	ui.loader.show()

	SOCKET = new WebSocket( env.WS_URL )

	SOCKET.onopen = function( event ){

		ui.loader.hide()

		console.log('connected ws' )

	}


	SOCKET.onmessage = function( msg ){

		// packet = false

		// try{

		packet = JSON.parse( msg.data )

		// }catch( e ){

		// 	SOCKET.bad_messages++
		// 	if( SOCKET.bad_messages > 100 ) {
		// 		console.log('100+ faulty socket messages', msg )
		// 		SOCKET.bad_messages = 0
		// 	}
		// 	console.log('failed to parse server msg: ', msg )
		// 	return false	

		// }

		// if( 0 && env.LOCAL && !env.LOG_WS_RECEIVE_EXCLUDES.includes( packet.type ) ) console.log( packet )

		// if( bound !== 1 && packet.type !== 'init_entry' ){
		// 	if( bound === 0 ){
		// 		bound = 'limbo'
		// 		if( packet.msg && packet.msg.match(/failed to find/)){
		// 			hal('error', packet.msg, 5000)
		// 		}
		// 		if( packet.type === 'hal' ){
		// 			hal( packet.msg_type, packet.msg, packet.time )
		// 		}
		// 		console.log('user not yet intialized.. packet: ', packet )
		// 	}else{
		// 		// limbo, nothing
		// 	}
		// 	return false
		// }

		// if( key === env.EVENT_WATCH_KEY ) event_watch( packet )

		switch( packet.type ){
			// ALL
			case 'init_world':
				BROKER.publish('WORLD_INIT', packet )
				bound = 1
				break;

			case 'player_log':
				BROKER.publish('PLAYER_EVENT', packet )
				break;
			
			case 'hal':
				hal( packet.msg_type, packet.msg, packet.time || 5000 )
				break;

			case 'error':
				hal('error', packet.msg || 'packet error', packet.time || 2000 )
				console.log('packet err: ', packet )
				break;

			default: console.log('unknown packet', packet )
		}

	}


	SOCKET.onerror = function( data ){
		console.log('server error', data)
		hal('error', 'server error')
	}

	SOCKET.onclose = function( event ){
		hal('error', 'connection closed')
	}

}






let send_packet

const send = event => {

	send_packet = event 

	if( SOCKET.readyState === 1 ) SOCKET.send( JSON.stringify( send_packet ))

}





BROKER.subscribe('SOCKET_SEND', send )




export default {
	init: init,
}

