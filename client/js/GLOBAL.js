import env from './env.js?v=1'



const client_data = {
	PLAY_WIDTH: 1000,
	PLAY_HEIGHT: 700,
	PLAY_SETTINGS: {
		PARTICLE_DENSITY: 5
	},
	// extra fields client only
	STANDARD_ACTIONS: [
		'idle',
		'ready',
		'walk',
		'run',
		'pickup',
		'melee',
		'melee2',
		'receive_hit',
		'spell',
		'death',
	],
	gen_color: type => {
		const c = glob.PLAY.COLORS[ type ]
		if( c ){
			return `rgb(${c[0]},${c[1]},${c[2]})`
		}
		return 'rgb(150, 150, 150)'
	}
}

let glob

const glob_data = document.querySelector('#global-data').innerText

if( !glob_data ){
	alert('missing server data')
}

try{
	glob = JSON.parse( glob_data )
	for( const key in client_data ) glob[ key ] = client_data[ key ]
}catch( e ){
	alert('error parsing server data')
	console.log( e )
}

if( env.EXPOSE ) window.GLOBAL = glob

export default glob
