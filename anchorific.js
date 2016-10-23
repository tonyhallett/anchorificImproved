/*
	The MIT License (MIT)

	Copyright (c) <2013> <Ren Aysha>

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
*/

if ( typeof Object.create !== 'function' ) {
	Object.create = function( obj ) {
		function F() {}
		F.prototype = obj;
		return new F();
	};
}

(function( $, window, document, undefined ) {
	"use strict";

	var Anchorific = {
	    
	    
		init: function( options, elem ) {
			var self = this;

			self.elem = elem;
			self.$elem = $( elem );

			self.opt = $.extend( {},  this.opt, options );

            
			self.headers = self.opt.findHeaders(self.$elem);
			self.previous = 0;

			// Fix bug #1
			if ( self.headers.length !== 0 ) {
			    self.first = self.opt.getPosn(self.headers.eq(0));
			}
			
			self.build();
		},

		opt: {
		    navigation: '.anchorific', // position of navigation
		    headers: 'h1, h2, h3, h4, h5, h6', // custom headers selector
			speed: 200, // speed of sliding back to top
			anchorClass: 'anchor', // class of anchor links
			anchorText: '#', // prepended or appended to anchor headings
			position: 'append', // position of anchor text
            applyAnchor:false,
			top: '.top', // back to top button or link class
			spy: true, // scroll spy
			spyOffset: !0, // specify heading offset for spy scrolling
            minTopScroll:200,
			findHeaders: function ($anchored) {
			    return $anchored.find(this.headers);
			},
		    headerAnchorClass:'',
			activeClassName: 'active',
            activeHeaderClassName:'activeHeader',
			textAttributeName: 'data-text',
			positionAttributeName: 'data-posn',
            getText: function ($headerEl) {
                var textAtt = $headerEl.attr(this.textAttributeName);
                if (textAtt !== undefined) {
                    text = textAtt;
                } else {
                    var text = $headerEl.text();
                }

                return text;
            },
            getPosn: function ($headerEl) {
                var posn;
                var dataPosn = $headerEl.attr(this.positionAttributeName);
                if (dataPosn !== undefined) {
                    posn = parseInt(dataPosn);
                } else {
                    posn = parseInt($headerEl.prop('nodeName').substring(1), null);
                }
                return posn;
            },
		    
		},
		
		build: function() {
			var self = this, obj, navigations = function() {};
			// when navigation configuration is set
			if ( self.opt.navigation ) {
				$( self.opt.navigation ).append( '<ul />' );
				self.previous = $( self.opt.navigation ).find( 'ul' ).last();
				navigations = function( obj ) {
					return self.navigations( obj );
				};
			}

			for( var i = 0; i < self.headers.length; i++ ) {
				obj = self.headers.eq( i );
				navigations(obj);
				
				self.anchor(obj);
				
				
			}

			if ( self.opt.spy )
				self.spy();

			if ( self.opt.top ) 
				self.back();
		},
		
		navigations: function( obj ) {
			var self = this, link, list, which, name = self.name( obj );

			if ( obj.attr( 'id' ) !== undefined )
				name = obj.attr( 'id' );

			var text = self.opt.getText(obj);
		    
			link = $('<a />').attr('href', '#' + name).text(text);
			if (self.opt.headerAnchorClass != "") {
			    link.addClass(self.opt.headerAnchorClass);
			}
			list = $( '<li />' ).append( link ); 

		    
			which = self.opt.getPosn(obj);
			list.attr( 'data-tag', which );

			self.subheadings( which, list );

			self.first = which;
		},

		subheadings: function( which, a ) {
			var self = this, ul = $( self.opt.navigation ).find( 'ul' ),
				li = $( self.opt.navigation ).find( 'li' );

			if ( which === self.first ) {
				self.previous.append( a );
			} else if ( which > self.first ) {
				li.last().append( '<ul />' );
				// can't use cache ul; need to find ul once more
				$( self.opt.navigation ).find( 'ul' ).last().append( a );
				self.previous = a.parent();
			} else {
				$( 'li[data-tag=' + which + ']' ).last().parent().append( a );
				self.previous = a.parent();
			}
		},

		name: function (obj) {
		    var text = this.opt.getText(obj);

			var name = text.replace( /[^\w\s]/gi, '' )
								.replace( /\s+/g, '-' )
								.toLowerCase();

			return name;
		},

		anchor: function( obj ) {
			var self = this, name = self.name( obj ), anchor, text = self.opt.anchorText,
				klass = self.opt.anchorClass, id;

			if ( obj.attr( 'id' ) === undefined )
				obj.attr( 'id', name );

			id = obj.attr( 'id' );

		    
			if (self.opt.applyAnchor) {
			    anchor = $('<a />').attr('href', '#' + id).html(text).addClass(klass);

			    if (self.opt.position === 'append') {
			        obj.append(anchor);
			    } else {
			        obj.prepend(anchor);
			    }
			}
			
			
		},

		back: function() {
			var self = this, body = $( 'body, html' ), top = $( self.opt.top );

			top.on( 'click', function( e ) {
				e.preventDefault();

				body.animate({
					'scrollTop': 0
				}, self.opt.speed );
			});
		},

		top: function( that ) {
			var self = this, top = self.opt.top, back;
			var minTopScroll = self.opt.minTopScroll;
			if ( top !== false ) {
				
			    if ($(that).scrollTop() > minTopScroll) {
			        if ($('#top').css('display') === 'none') {
			            $('#top').css('display', '')
			        }
			        
				    $(top).fadeIn();
				} else {
				    $(top).fadeOut();
				}
			}
		},

		spy: function () {
		    var self = this, current, list, prev,prevExact

		    $(window).scroll(function (e) {
		        // show links back to top
		        self.top(this);
		        // get all the header on top of the viewport
		        current = self.headers.map(function (e) {
		            var $this = $(this);
		            var windowScrollTop = $(window).scrollTop();
		            if (($(this).offset().top - windowScrollTop) < self.opt.spyOffset) {
		                return this;
		            }
		        });
		        
		        // get only the latest header on the viewport
		        current = $(current).eq(current.length - 1);

		        //have removed outside of the if statement - corrects issue
		        if (prev !== undefined) {
		            prev.removeClass(self.opt.activeClassName);
                    prevExact.removeClass(self.opt.activeHeaderClassName)
		        }
		        

		        if (current && current.length) {
		            console.log("Last header in view, " + current.text());
		            // get all li tag that contains href of # ( all the parents )
		            list = $('li:has(a[href="#' + current.attr('id') + '"])');
		            prevExact = list.eq(list.length - 1);
		            
		            prevExact.addClass(self.opt.activeHeaderClassName);

		            
		            list.addClass(self.opt.activeClassName);
		            prev = list;
		        }
                
		    });
		}
	};

	$.fn.anchorific = function( options ) {
		return this.each(function() {
			if ( ! $.data( this, 'anchorific' ) ) {
				var anchor = Object.create( Anchorific );

				anchor.init( options, this );

				$.data( this, 'anchorific', anchor );
			}
		});
	};

})( jQuery, window, document );