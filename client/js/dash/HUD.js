import BROKER from '../EventBroker.js?v=1'
import * as lib from '../lib.js?v=1'



// ------------------------------------
// build HUD
// ------------------------------------

const hud = {
	ele: lib.b('div', 'hud'),
	sections: {
		player_log: {
			width: 400,
		},
		npc_log: {
			width: 400,
		},
		owner_details: {
			width: 200,
		},
		guild_log: {
			width: 400
		},
		social_media_log: {
		},
	}
}
document.body.append( hud.ele )


const build_section = ( key, data ) => {
	const section = lib.b('div', 'section_' + key, 'hud-section')
	section.style.width = data.width ? data.width + 'px' : '95%'
	const header = lib.b('div', false, 'section-header')
	header.innerText = key
	const content = lib.b('div', false, 'section-content')
	section.append( header )
	section.append( content )
	return section
}


for( const key in hud.sections ){
	const section = build_section( key, hud.sections[key] )
	hud.ele.append( section )
	hud.sections[key].ele = section
}






// ------------------------------------
// subscribers
// ------------------------------------

const stuff = event => {
	///////
}



BROKER.subscribe('HUD_STUFF', stuff )


export default hud