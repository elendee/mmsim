import env from './env.js?v=1'
import {
	random_hex,
	random_entry,
} from './lib.js?v=1'
import BROKER from './EventBroker.js?v=1'
import fetch_wrap from './fetch_wrap.js?v=1'
import Sprif from './inc/ui/Sprif.js?v=1'









let spinning = false

class Spinner{

	constructor( init ){
		init = init || {}
		this.ele = init.ele || document.createElement('div')
		this.ele.classList.add('spinner')
		this.img = init.img || document.createElement('img')
		this.img.src = this.img.src || init.src
		this.ele.appendChild( this.img )

		document.body.appendChild( this.ele )
	}

	show( ele ){
		if( ele ){
			ele.appendChild( this.ele )
		}else{
			document.body.appendChild( this.ele )
		}
		this.ele.style.display = 'flex'
		if( spinning ){
			clearTimeout(spinning)
			spinning = false
		}
		spinning = setTimeout(()=>{
			clearTimeout(spinning)
			spinning = false
		}, 10 * 1000)
	}
	hide(){
		this.ele.remove()
		// this.ele.style.display = 'none'
	}
}


const spinner = new Spinner({
	src: '/resource/media/spinner.png'
})











// menu

const mobile_toggle = document.querySelector('#mobile-toggle')
const menu_links = document.querySelector('#main-links')
mobile_toggle.addEventListener('click', () => {
	menu_links.classList.toggle('toggled')
})	





class SprifLoader{
	/*
		an updated version of Spinner
	*/

	constructor( init ){
		init = init || {}
		this.name = init.name 
		this.ele = init.ele || document.createElement('div')
		this.ele.classList.add('loader')
		this.sprif = new Sprif( init )
		this.ele.appendChild( this.sprif.ele )

		document.body.appendChild( this.ele )
		this.sprif.show()
		this.hide()
	}

	show( ele ){
		if( ele ){
			ele.appendChild( this.ele )
		}else{
			document.body.appendChild( this.ele )
		}
		this.ele.style.display = 'flex'
		this.sprif.start()
		// if( spinning ){
		// 	clearTimeout(spinning)
		// 	spinning = false
		// }
		// spinning = setTimeout(()=>{
		// 	clearTimeout(spinning)
		// 	spinning = false
		// }, 10 * 1000)
	}
	hide(){
		this.sprif.stop()
		this.ele.remove()
		// this.ele.style.display = 'none'
	}
}

const loader_sets = {
	robot: [
		{
			name: 'pilot_suit',
			img_url: '/resource/media/grafxkid/sprite_pack_5/1 - Robo Retro/Pilot_Suiting-up_(32 x 32).png',
			frame_width: 32,
			frame_height: 32,
			frame_count: 8,
			row_length: 8,
			fps: 7,
			id: random_hex(6),
			scalar: 7,	
		},
		{
			name: 'spin_attack',
			img_url: '/resource/media/grafxkid/sprite_pack_5/1 - Robo Retro/Spin-attack_(32 x 32).png',
			frame_width: 32,
			frame_height: 32,
			frame_count: 6,
			row_length: 6,
			fps: 7,
			id: random_hex(6),
			scalar: 7,	
		},
	],
	wiz: [
		{
			name: 'cast_spell',
			img_url: '/resource/media/grafxkid/sprite_pack_5/2 - Lil Wiz/Casting_Spell_(32 x 32).png',
			frame_width: 32,
			frame_height: 32,
			frame_count: 4,
			row_length: 4,
			fps: 7,
			id: random_hex(6),
			scalar: 7,	
		},
		{
			name: 'running',
			img_url: '/resource/media/grafxkid/sprite_pack_5/2 - Lil Wiz/Running_(32 x 32).png',
			frame_width: 32,
			frame_height: 32,
			frame_count: 6,
			row_length: 6,
			fps: 7,
			id: random_hex(6),
			scalar: 7,	
		},
	
		{
			name: 'cast_spell2',
			img_url: '/resource/media/grafxkid/sprite_pack_5/2 - Lil Wiz/Casting_Spell_Repeating_(32 x 32).png',
			frame_width: 32,
			frame_height: 32,
			frame_count: 4,
			row_length: 4,
			fps: 7,
			id: random_hex(6),
			scalar: 7,	
		},
		{
			name: 'cast_aerial',
			img_url: '/resource/media/grafxkid/sprite_pack_5/2 - Lil Wiz/Casting_Spell_Aerial_(32 x 32).png',
			frame_width: 32,
			frame_height: 32,
			frame_count: 4,
			row_length: 4,
			fps: 7,
			id: random_hex(6),
			scalar: 7,	
		},
	],
	sparkles: [
		{
			name: 'sparkles',
			img_url: '/resource/media/grafxkid/sprite_pack_5/2 - Lil Wiz/Sparkles_(8 x 8).png',
			frame_width: 32,
			frame_height: 32,
			frame_count: 4,
			row_length: 4,
			fps: 7,
			id: random_hex(6),
			scalar: 5,	
		},
		{
			name: 'orbs',
			img_url: '/resource/media/grafxkid/sprite_pack_5/2 - Lil Wiz/Magical_Orbs_Spell_(32 x 32).png',
			frame_width: 32,
			frame_height: 32,
			frame_count: 4,
			row_length: 4,
			fps: 7,
			id: random_hex(6),
			scalar: 5,	
		},
		
	]
}

console.log('skipping sprifs')
const loaders = window.loaders = {}

for( const type in loader_sets ){
	if( !loaders[type] ) loaders[type] = []
	for( const set of loader_sets[type] ){
		loaders[type].push( new SprifLoader( set ))
	}
}

const loader = window.loader = {
	/*
		hacky object meant to imitate Loader syntax... 
	*/

	show: ( ele, type, name ) => {
		let choice, typeset
		if( type ){
			typeset = loaders[type]
			if( name ){
				for( const ele of typeset ){
					console.log('tf', ele )
					if( ele.name === name ){
						choice = ele
						break;
					}
				}				
			}else{
				choice = random_entry( typeset )
			}

		}else{
			typeset = random_entry( loaders )
			choice = random_entry( typeset )
		}
		if( !choice ) return console.error('invalid loader choice', type, name )
		choice.show( ele )
	},
	hide: () => {
		for( const type in loaders ){
			for( const set of loaders[type]){
				set.hide()
			}
		}
	}
}






// BROKER.subscribe('REFRESH_UNREAD', refresh_unread )


// export

export default {
	loader,
	spinner,
}
