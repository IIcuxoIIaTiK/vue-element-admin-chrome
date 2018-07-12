'use strict';

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

const injectSidebar = () => {
	console.log("injectSidebar function...")

	$.get(chrome.extension.getURL('assets/html/sidebar.html'), function(data) {
	    $(data).prependTo('body');
	});

}

function injectSidebarClass(elem, classes) {
	console.log("elem: ")
	console.log(elem)
	var i;
	for (i = 0; i < classes.length; i++) { 
		console.log("class:", classes[i])
		elem.addClass(classes[i])
	}
	// return elem
}

var sidebarMainElement = $("div.application-main")

console.log("sidebarMainElement: ")
console.log(sidebarMainElement)

const sidebarMainClasses = ['st-container', 'st-effect-1', 'st-menu-open']
console.log("sidebarMainClasses: ")
console.log(sidebarMainClasses)

const injectSidebarVueJS = () => {
	$.get(chrome.extension.getURL('assets/html/sidebar-vuejs.html'), function(data) {
	    $(data).prependTo('body');

	   	injectSidebarClass($("div.application-main"), sidebarMainClasses)
		$("div.application-main").attr('id', 'st-container')

		console.log("role='main'.css", $("div.application-main").css())
	    console.log("injectSidebarVueJS prependTo...")
	});
	(function() {
	    "use strict"
	    /*
		export default {
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
		    }
		  }
		}
		*/
	    console.log("injectSidebarVueJS init...")
	})()
}

injectSidebarVueJS()