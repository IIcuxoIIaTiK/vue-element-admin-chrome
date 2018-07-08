<template>
  <div id="admin">
	  <div :class="['st-container', 'st-effect-11', menuState ? 'st-menu-open' : '']"  v-click-outside="onClickBackground">
		  <button :class="['snk-button', menuState ? 'snk-button-hidden' : '']" @click="openMenu">SNK</button>
	    <nav class="st-menu st-effect-11">
		    <router-view></router-view>
	      <slot name="nav"></slot>
	    </nav>
	    <div class="st-pusher" @click="closeMenu">
	      <div class="st-content">
	        <div class="st-content-inner">

	          <!-- browser content - start -->
						<iframe src="https://golanglibs.com/" class="iframe">
							Your browser doesn't support iframes
						</iframe>
	          <!-- browser content - end -->

	          <slot></slot>
	        </div>
	      </div>
	    </div>
	  </div>
  </div>
</template>

<script>
export default {
  name: 'Admin',
  data () {
    return {
      menuState: false
    }
  },
  methods: {
    openMenu () {
      this.menuState = true
    },
    closeMenu () {
      if (this.menuState) {
        this.menuState = false
      }
    },
    onClickBackground (e, el) {
      console.log('onClickOutside')
      // console.log('click heard outside element:', el)
      // console.log('element clicked:', e.target)
      // console.log('event:', e)
      if (this.menuState) {
        this.menuState = false
      }
    }
  }
}
</script>

<style>

	body {
		margin: 0;  /* Reset default margin */
	}

	.iframe {
		display: block;       /* iframes are inline by default */
		position: fixed; 
		top: 0px; 
		left: 0px; 
		bottom: 0px; 
		right: 0px; 
		height: 100vh;        /* Viewport-relative units */ 
		width: 100vw; 
		border: none;         /* Reset default border */
		margin: 0; 
		padding: 0; 
		overflow: hidden; 
		z-index: 1;
	}

	.user-avatar {
		visibility: hidden;
	}

  .snk-button {
	  width: 150px;
	  height: 50px;
	  position: absolute;
	  left: 0;
	  top: 0px;
	  z-index: 16777272;
	  border: none;
	  padding: 0.6em 1.2em;
		background: rgba(0,0,0,0.9);
	  /* background: #333; */
	  color: #fff;
	  font-family: 'Lato', Calibri, Arial, sans-serif;
	  font-size: 1em;
	  letter-spacing: 1px;
	  text-transform: uppercase;
	  cursor: pointer;
	  display: inline-block;
	  margin: 3px 2px;
	  border-radius: 2px;
	}
	
	.snk-button-hidden {
		visibility: hidden;
	}

	.snk-button:hover {
	  background: #2c774b;
	}

*,
*:after,
*::before {
	-moz-box-sizing: border-box;
	box-sizing: border-box;
}

.st-container,
.st-pusher,
.st-content {
	width: 100%;
	height: 100%;
	margin: 0px;
	z-index: 0;
	/* background: #444; */
}

.st-content {
	overflow-y: scroll;
	/* background: #f3efe0; */
}

.st-content,
.st-content-inner {
	position: relative;
}

.st-container {
	position: relative;
	overflow: hidden;
}

.st-pusher {
	position: relative;
	left: 0;
	z-index: 99;
	height: 100%;
	perspective: 1000px;
	-webkit-transition: -webkit-transform 0.5s;
	transition: transform 0.5s;
}

.st-pusher::after {
	position: absolute;
	top: 0;
	right: 0;
	width: 0;
	height: 0;
	background: rgba(0,0,0,0.2);
	content: '';
	opacity: 0;
	-webkit-transition: opacity 0.5s, width 0.1s 0.5s, height 0.1s 0.5s;
	transition: opacity 0.5s, width 0.1s 0.5s, height 0.1s 0.5s;
}

.st-menu-open .st-pusher::after {
	width: 100%;
	height: 100%;
	opacity: 1;
	-webkit-transition: opacity 0.5s;
	transition: opacity 0.5s;
}

.st-menu {
	position: absolute;
	top: 0;
	left: 0;
	z-index: 100;
	visibility: hidden;
	width: 550px;
	height: 100%;
	/* background: rgba(0,0,0,0.8); */
	background: #eee;
	-webkit-transition: all 0.5s;
	transition: all 0.5s;
}

.st-menu::after {
	position: absolute;
	top: 0;
	right: 0;
	width: 100%;
	height: 100%;
	background: rgba(0,0,0,0.2);
	content: '';
	opacity: 1;
	-webkit-transition: opacity 0.5s;
	transition: opacity 0.5s;
}

.st-menu-open .st-menu::after {
	width: 0;
	height: 0;
	opacity: 0;
	-webkit-transition: opacity 0.5s, width 0.1s 0.5s, height 0.1s 0.5s;
	transition: opacity 0.5s, width 0.1s 0.5s, height 0.1s 0.5s;
}

/* content style */

.st-menu ul {
	margin: 0;
	padding: 0;
	list-style: none;
}

.st-menu h2 {
	margin: 0;
	padding: 1em;
	color: rgba(0,0,0,0.4);
	text-shadow: 0 0 1px rgba(0,0,0,0.1);
	font-weight: 300;
	font-size: 2em;
}

.st-menu ul li a {
	display: block;
	padding: 1em 1em 1em 1.2em;
	outline: none;
	box-shadow: inset 0 -1px rgba(0,0,0,0.2);
	color: #f3efe0;
	/*
	text-transform: uppercase;
	text-shadow: 0 0 1px rgba(255,255,255,0.1);
	letter-spacing: 1px;
	font-weight: 400;
	*/
	-webkit-transition: background 0.3s, box-shadow 0.3s;
	transition: background 0.3s, box-shadow 0.3s;
}

.st-menu ul li:first-child a {
	box-shadow: inset 0 -1px rgba(0,0,0,0.2), inset 0 1px rgba(0,0,0,0.2);
}

.st-menu ul li a:hover {
	background: rgba(0,0,0,0.2);
	box-shadow: inset 0 -1px rgba(0,0,0,0);
	color: #fff;
}

/* Effect 9: Scale down pusher */

.st-effect.st-container {
	-webkit-perspective: 1500px;
	perspective: 1500px;
}

.st-effect .st-pusher {
	-webkit-transform-style: preserve-3d;
	transform-style: preserve-3d;
}

.st-effect.st-menu-open .st-pusher {
	-webkit-transform: translate3d(0, 0, -300px);
	transform: translate3d(0, 0, -300px);
}

.st-effect.st-menu {
	opacity: 1;
	-webkit-transform: translate3d(-100%, 0, 0);
	transform: translate3d(-100%, 0, 0);
}

.st-effect.st-menu-open .st-effect.st-menu {
	visibility: visible;
	-webkit-transition: -webkit-transform 0.5s;
	transition: transform 0.5s;
	-webkit-transform: translate3d(0, 0, 0);
	transform: translate3d(0, 0, 0);
}

.st-effect.st-menu::after {
	display: none;
}

/* Individual effects */

/* Effect 1: Slide in on top */
.st-effect-1.st-menu {
  visibility: visible;
  -webkit-transform: translate3d(-100%, 0, 0);
  transform: translate3d(-100%, 0, 0);
}

.st-effect-1.st-menu-open .st-effect-1.st-menu {
  visibility: visible;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}

.st-effect-1.st-menu::after {
  display: none;
}

/* Effect 2: Reveal */
.st-effect-2.st-menu-open .st-pusher {
  -webkit-transform: translate3d(300px, 0, 0);
  transform: translate3d(300px, 0, 0);
}

.st-effect-2.st-menu {
  z-index: 1;
}

.st-effect-2.st-menu-open .st-effect-2.st-menu {
  visibility: visible;
  -webkit-transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
}

.st-effect-2.st-menu::after {
  display: none;
}

/* Effect 3: Push*/
.st-effect-3.st-menu-open .st-pusher {
  -webkit-transform: translate3d(300px, 0, 0);
  transform: translate3d(300px, 0, 0);
}

.st-effect-3.st-menu {
  -webkit-transform: translate3d(-100%, 0, 0);
  transform: translate3d(-100%, 0, 0);
}

.st-effect-3.st-menu-open .st-effect-3.st-menu {
  visibility: visible;
  -webkit-transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
}

.st-effect-3.st-menu::after {
  display: none;
}

/* Effect 4: Slide along */
.st-effect-4.st-menu-open .st-pusher {
  -webkit-transform: translate3d(300px, 0, 0);
  transform: translate3d(300px, 0, 0);
}

.st-effect-4.st-menu {
  z-index: 1;
  -webkit-transform: translate3d(-50%, 0, 0);
  transform: translate3d(-50%, 0, 0);
}

.st-effect-4.st-menu-open .st-effect-4.st-menu {
  visibility: visible;
  -webkit-transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}

.st-effect-4.st-menu::after {
  display: none;
}

/* Effect 5: Reverse slide out */
.st-effect-5.st-menu-open .st-pusher {
  -webkit-transform: translate3d(300px, 0, 0);
  transform: translate3d(300px, 0, 0);
}

.st-effect-5.st-menu {
  z-index: 1;
  -webkit-transform: translate3d(50%, 0, 0);
  transform: translate3d(50%, 0, 0);
}

.st-effect-5.st-menu-open .st-effect-5.st-menu {
  visibility: visible;
  -webkit-transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}

/* Effect 6: Rotate pusher */

.st-effect-6.st-container {
  -webkit-perspective: 1500px;
  perspective: 1500px;
}

.st-effect-6 .st-pusher {
  -webkit-transform-origin: 0% 50%;
  transform-origin: 0% 50%;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.st-effect-6.st-menu-open .st-pusher {
  -webkit-transform: translate3d(300px, 0, 0) rotateY(-15deg);
  transform: translate3d(300px, 0, 0) rotateY(-15deg);
}

.st-effect-6.st-menu {
  -webkit-transform: translate3d(-100%, 0, 0);
  transform: translate3d(-100%, 0, 0);
  -webkit-transform-origin: 100% 50%;
  transform-origin: 100% 50%;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.st-effect-6.st-menu-open .st-effect-6.st-menu {
  visibility: visible;
  -webkit-transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
  -webkit-transform: translate3d(-100%, 0, 0) rotateY(15deg);
  transform: translate3d(-100%, 0, 0) rotateY(15deg);
}

.st-effect-6.st-menu::after {
  display: none;
}

/* Effect 7: 3D rotate in */

.st-effect-7.st-container {
  -webkit-perspective: 1500px;
  perspective: 1500px;
  -webkit-perspective-origin: 0% 50%;
  perspective-origin: 0% 50%;
}

.st-effect-7 .st-pusher {
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.st-effect-7.st-menu-open .st-pusher {
  -webkit-transform: translate3d(300px, 0, 0);
  transform: translate3d(300px, 0, 0);
}

.st-effect-7.st-menu {
  -webkit-transform: translate3d(-100%, 0, 0) rotateY(-90deg);
  transform: translate3d(-100%, 0, 0) rotateY(-90deg);
  -webkit-transform-origin: 100% 50%;
  transform-origin: 100% 50%;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.st-effect-7.st-menu-open .st-effect-7.st-menu {
  visibility: visible;
  -webkit-transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
  -webkit-transform: translate3d(-100%, 0, 0) rotateY(0deg);
  transform: translate3d(-100%, 0, 0) rotateY(0deg);
}

/* Effect 8: 3D rotate out */

.st-effect-8.st-container {
  -webkit-perspective: 1500px;
  perspective: 1500px;
  -webkit-perspective-origin: 0% 50%;
  perspective-origin: 0% 50%;
}

.st-effect-8 .st-pusher {
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.st-effect-8.st-menu-open .st-pusher {
  -webkit-transform: translate3d(300px, 0, 0);
  transform: translate3d(300px, 0, 0);
}

.st-effect-8.st-menu {
  -webkit-transform: translate3d(-100%, 0, 0) rotateY(90deg);
  transform: translate3d(-100%, 0, 0) rotateY(90deg);
  -webkit-transform-origin: 100% 50%;
  transform-origin: 100% 50%;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.st-effect-8.st-menu-open .st-effect-8.st-menu {
  visibility: visible;
  -webkit-transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
  -webkit-transform: translate3d(-100%, 0, 0) rotateY(0deg);
  transform: translate3d(-100%, 0, 0) rotateY(0deg);
}

.st-effect-8.st-menu::after {
  display: none;
}

/* Effect 9: Scale down pusher */

.st-effect-9.st-container {
  -webkit-perspective: 1500px;
  perspective: 1500px;
}

.st-effect-9 .st-pusher {
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.st-effect-9.st-menu-open .st-pusher {
  -webkit-transform: translate3d(0, 0, -300px);
  transform: translate3d(0, 0, -300px);
}

.st-effect-9.st-menu {
  opacity: 1;
  -webkit-transform: translate3d(-100%, 0, 0);
  transform: translate3d(-100%, 0, 0);
}

.st-effect-9.st-menu-open .st-effect-9.st-menu {
  visibility: visible;
  -webkit-transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}

.st-effect-9.st-menu::after {
  display: none;
}

/* Effect 10: Scale up */

.st-effect-10.st-container {
  -webkit-perspective: 1500px;
  perspective: 1500px;
  -webkit-perspective-origin: 0% 50%;
  perspective-origin: 0% 50%;
}

.st-effect-10.st-menu-open .st-pusher {
  -webkit-transform: translate3d(300px, 0, 0);
  transform: translate3d(300px, 0, 0);
}

.st-effect-10.st-menu {
  z-index: 1;
  opacity: 1;
  -webkit-transform: translate3d(0, 0, -300px);
  transform: translate3d(0, 0, -300px);
}

.st-effect-10.st-menu-open .st-effect-10.st-menu {
  visibility: visible;
  -webkit-transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}

/* Effect 11: Scale and rotate pusher */

.st-effect-11.st-container {
  -webkit-perspective: 1500px;
  perspective: 1500px;
}

.st-effect-11 .st-pusher {
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.st-effect-11.st-menu-open .st-pusher {
  -webkit-transform: translate3d(200px, 0, -300px) rotateY(-20deg);
  transform: translate3d(200px, 0, -300px) rotateY(-20deg);
}

.st-effect-11.st-menu {
  opacity: 1;
  -webkit-transform: translate3d(-100%, 0, 0);
  transform: translate3d(-100%, 0, 0);
}

.st-effect-11.st-menu-open .st-effect-11.st-menu {
  visibility: visible;
  -webkit-transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}

.st-effect-11.st-menu::after {
  display: none;
}

/* Effect 12: Open door */

.st-effect-12.st-container {
  -webkit-perspective: 1500px;
  perspective: 1500px;
}

.st-effect-12 .st-pusher {
  -webkit-transform-origin: 100% 50%;
  transform-origin: 100% 50%;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.st-effect-12.st-menu-open .st-pusher {
  -webkit-transform: rotateY(-10deg);
  transform: rotateY(-10deg);
}

.st-effect-12.st-menu {
  opacity: 1;
  -webkit-transform: translate3d(-100%, 0, 0);
  transform: translate3d(-100%, 0, 0);
}

.st-effect-12.st-menu-open .st-effect-12.st-menu {
  visibility: visible;
  -webkit-transition: -webkit-transform 0.5s;
  transition: transform 0.5s;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}

.st-effect-12.st-menu::after {
  display: none;
}

/* Effect 13: Fall down */

.st-effect-13.st-container {
  -webkit-perspective: 1500px;
  perspective: 1500px;
  -webkit-perspective-origin: 0% 50%;
  perspective-origin: 0% 50%;
}

.st-effect-13.st-menu-open .st-pusher {
  -webkit-transform: translate3d(300px, 0, 0);
  transform: translate3d(300px, 0, 0);
}

.st-effect-13.st-menu {
  z-index: 1;
  opacity: 1;
  -webkit-transform: translate3d(0, -100%, 0);
  transform: translate3d(0, -100%, 0);
}

.st-effect-13.st-menu-open .st-effect-13.st-menu {
  visibility: visible;
  -webkit-transition-timing-function: ease-in-out;
  transition-timing-function: ease-in-out;
  -webkit-transition-property: -webkit-transform;
  transition-property: transform;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
  -webkit-transition-speed: 0.2s;
  transition-speed: 0.2s;
}

/* Effect 14: Delayed 3D rotate */

.st-effect-14.st-container {
  -webkit-perspective: 1500px;
  perspective: 1500px;
  -webkit-perspective-origin: 0% 50%;
  perspective-origin: 0% 50%;
}

.st-effect-14 .st-pusher {
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.st-effect-14.st-menu-open .st-pusher {
  -webkit-transform: translate3d(300px, 0, 0);
  transform: translate3d(300px, 0, 0);
}

.st-effect-14.st-menu {
  -webkit-transform: translate3d(-100%, 0, 0) rotateY(90deg);
  transform: translate3d(-100%, 0, 0) rotateY(90deg);
  -webkit-transform-origin: 0% 50%;
  transform-origin: 0% 50%;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.st-effect-14.st-menu-open .st-effect-14.st-menu {
  visibility: visible;
  -webkit-transition-delay: 0.1s;
  transition-delay: 0.1s;
  -webkit-transition-timing-function: ease-in-out;
  transition-timing-function: ease-in-out;
  -webkit-transition-property: -webkit-transform;
  transition-property: transform;
  -webkit-transform: translate3d(-100%, 0, 0) rotateY(0deg);
  transform: translate3d(-100%, 0, 0) rotateY(0deg);
}

/* Fallback example for browsers that don't support 3D transforms (and no JS fallback) */
.no-csstransforms3d .st-pusher,
.no-js .st-pusher {
  padding-left: 300px;
}

</style>