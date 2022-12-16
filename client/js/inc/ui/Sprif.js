/*
	example:
		const sprif = window.sprif = new Sprif({
			img_url: './Pilot_Suiting-up_(32 x 32).png',
			frame_width: 32,
			frame_height: 32,
			scalar: 10,
			row_length: 8,
			fps: 6,
			id: 'sprif-test',
			frame_count: 8,
		})

	scaling:
		just transform() or make 2 separate ones for now....

*/

const sprif_style = document.createElement('style')
sprif_style.innerHTML =`
.sprif{
	overflow: hidden;
	position: relative;
}
.sprif img{
	image-rendering: pixelated;
	position: absolute;
	max-width: 10000000px;
	max-height: 10000000px;
}`
document.head.append( sprif_style )

class Sprif {
	constructor( init ){
		const required = [
			'id', 
			'img_url',
			'frame_width',
			'frame_height',
			'row_length',
			'frame_count',
		]
		for( const req of required ){
			if( !init[req] && typeof init[req] !== 'number' ) console.error('missing required sprif init: ' + req )
		}
		// build DOM
		this.ele = document.createElement('div')
		this.ele.classList.add('sprif')
		this.ele.id = init.id
		this.img_url = init.img_url
		this.img = document.createElement('img')
		this.img.src = this.img_url
		this.img.onload = () => {
			this.init_size()
		}
		this.ele.append( this.img )
		// defaults
		this.scalar = init.scalar || 1
		this.fps = init.fps || 5
		this.animation = false
		// init size props
		this.frame_width = init.frame_width * this.scalar
		this.frame_height = init.frame_height * this.scalar
		this.row_length = init.row_length
		this.frame_count = init.frame_count
		this.row_count = Math.ceil( this.frame_count / this.row_length ) // ( derived )

		this.ele.style.background = 'url(' + this.img_url + ') 0px 0px '
		// current frame position:
		this.frameX = 0
		this.frameY = 0
	}
	init_size(){

		this.img.style.width = ( this.frame_width * this.row_length ) + 'px'
		this.img.style.height = ( this.frame_height * this.row_count ) + 'px'			

		this.ele.style.width = this.frame_width + 'px'
		this.ele.style.height = this.frame_height + 'px'

		// console.log( this.ele.style.width )
		// console.log( this.img.style.width )

		this.sized = true
	}
	start(){

		// console.log('sprif call')
		if( this.animation ) return
		// console.log('sprif proceed')
		this.animation = setInterval(() => {

			this.img.style.left = -this.frameX + 'px'
			this.img.style.top = this.frameY + 'px'

			this.frameX += this.frame_width

			if( this.frameX >= ( this.frame_width * this.row_length ) ){
				this.frameY += this.frame_height
				this.frameX = 0
			}
			if( this.frameY >= this.row_count ){
				this.frameY = 0
			}				

			// this.frameY += this.frame_height
		}, 1000 / this.fps )
	}
	stop(){
		clearInterval( this.animation )
		this.animation = false
	}
	setFramerate( fps ){
		this.fps = typeof fps === 'number' ? fps : 5
		this.stop()
		this.start()
	}
	setDirection( dir ){
		// ...
	}
	show(){
		this.ele.style.display = 'inline-block'
	}
	hide(){
		this.ele.style.display = 'none'
	}
}


export default Sprif