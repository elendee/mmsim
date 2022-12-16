import * as lib from '../lib.js?v=1'
import BROKER from '../EventBroker.js?v=1'
import HUD from './HUD.js?v=1'







const build_log = ( type, data ) => {

	const wrap = lib.b('div', false, 'log-element')

	switch( type ){
	case 'player_log':
		const { 
			event_type, 
			name, 
			uuid 
		} = data
		wrap.setAttribute('data-uuid', uuid )
		wrap.classList.add( event_type )
		wrap.innerHTML = `<span class="event_type ${ event_type }">[${ event_type }]</span> <span class="player-name">${ name } </span>`
		break;
	case 'npcs':
		break;
	case 'social_media':
		break;
	case 'guild':
		break;
	}
	// console.log( type, data, wrap )
	return wrap
}



const init = event => {
	const { world } = event

	console.log('woohoo', world )



}


const handle_log_event = event => {
	const { type, data } = event

	const ele = HUD.sections[ type ]?.ele
	if( !ele ) return console.log('no HUD ele for :', event )

	ele.prepend( build_log( type, data ) )
}



BROKER.subscribe('WORLD_INIT', init )
// BROKER.subscribe('WORLD_EVENT', handle_log_event )
BROKER.subscribe('PLAYER_EVENT', handle_log_event )


export default {}