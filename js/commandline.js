function Commandline( inOptions ) {
	var that = this,
		DEBUG = true,
		isInit = false,
		isVisible = false,
		widgetHtmlId = "siteConsole",
		selector = ' .commandline',
		options = {
			'debug' : true,
			'preInit' : function(){},
			'ready' : function(){}
		},
		history = [],
		historyMaxSize = 40,
		activeCommandInHistory;

	var sysCommands = {
		history : function(params) {
			for(i in history){
				echo('<span class="command">' + history[i] + '</span>');
			}
		},
		list : function(params) {
			for (i in this) {
				echo('<span class="command">' + i + '</span>');
			}
			/*$(".command").click(function() {
				$(".commandline").val($(this).html());
			});*/
		},
		quit : function(params) {
			document.cookie = "";
			$('#' + widgetHtmlId).remove();
			history = [];
			isInit = false;
		},
		clear : function(params) {
			$(".console-content").empty();
		},
		man : function(params) {
			if(params.length != 1) {
				throw('command <span class="command">man</span> has 1 parametr');
			}
			if(manuals[params[0]] != undefined) {
				echo(manuals[params[0]]);
			} else {
				echo('no manual for <span class="command">' + params[0], "bold");
			}
		}

		/* add commands here */
	},
	manuals = {
		history : "output command history with repeats, has no input paramets.",
		list : "list of available system commands",
		quit : "quit from console, and destroy it",
		clear : "clears console",
		man : "man [command] <br/><br/>man shows manual for command, has one input paramet - command name. <br/><br/>Example: man list"
	}

	

	/*--- public methods ---*/
	this.init = function() {
		try {
			if(!isInit) {
				options = extend(options, inOptions);
				options.preInit();
				generateHtml();
				fillHistory();
				addListeners();
				options.ready();
				isInit = true;
				log("console init success");	
			} else {
				log("console already inited");
			}
		} catch (e) {
			log("init error "+ e);
		}
	}

	this.hide = function(){
		$('#' + widgetHtmlId).hide();
		isVisible = false;
	}

	this.show = function(){
		$('#' + widgetHtmlId).show();
		isVisible = true;
	}

	/*--- private methods ---*/
	var fillHistory = function() {
		var history = getCookie('history');
		log(history);
		if (history && false) {
			activeCommandInHistory = history.length;
			//log(activeCommandInHistory);
			history.reverse();
			for(i in history) {
				if (unique.indexOf(history[i]) == -1) {
					unique.push(history[i]);
					cl = (isActive) ? "active" : "";
					isActive = false;
					html += '<div style="display:none" class="line ' + cl + '" id="command_' + i + '">' + history[i] + '</div>';
				}
			}
			$(".helper").html(html);
		}
	}

	var addListeners = function() {
		$("#" + widgetHtmlId + selector).keyup(function(event) {
			var keycode = (event.keyCode ? event.keyCode : event.which),
				command = $(this).val();
			switch (keycode) {
				case 13:
					parser(command);
					$(this).val("");
					break;
				case 38: 
				case 40:
					navigateHistory( (keycode == 38) );
					break;
				case 27:
					$(".helper .line").hide();
					$(this).val("");
					break;
				default:
					//log(keycode);
					/*if(command.length == 0) {
						$(".helper .line").hide();
					} else {
						helper(command);
					}*/
			}
		})

		$(document).keypress(function(e){
			var keycode = (e.keyCode ? e.keyCode : e.which);
			if(keycode == 96){
				(!isInit) ? that.init() : (isVisible) ? that.hide() : that.show();
			}
		});
		/*.dblclick(function(){ helper(); })*/;

		/*$(".helper .line").click(function() {
			$(this).parent().find(".active").removeClass("active");
			$(this).addClass("active");
			$("#" + widgetHtmlId + selector)
				.val($(this).html())
				.focus();
			helper($(this).html());
		});*/
	}

	/*var helper = function(command) {
		$(".helper .line").hide();
		command = command || '';
		for(i in history) {
			if (history[i].indexOf(command) != -1) {
				$(".helper .line#command_" + i).show();
			}
		}
	}*/

	var navigateHistory = function(isUp){
		log(activeCommandInHistory);
		if (isUp) {
			if (history[activeCommandInHistory - 1] == undefined) return;
		} else {
			if (history[activeCommandInHistory] == undefined) {$(".commandline").val(""); return;}
		}
		log(12);
		activeCommandInHistory += (isUp) ? -1 : 1;
		$(".commandline").val(history[activeCommandInHistory]);
	}

	var parser = function(command) {
		try {
			if(command.length == 0) return false;
			history.push(command)
			refreshCommandsCookies();
			fillHistory();
			echo('<br>execute command <span class="command">' + command + '</span>:', "bold");
			var cmd = $.trim(command).split(" ").reverse();
			// first element of cmd is command, the rest is parametrs
			command = cmd.pop();
			that.execComand(command, cmd)

			// $(".helper .line").hide();
		} catch (e) {
			echo('<br><span style="color:red">' + e + '</span>');
		}
		$('.console').animate({scrollTop: $(".console-content").height()}, 'slow');
	}

	this.execComand = function(command, params) {
		if (sysCommands[command] != undefined) {
			return sysCommands[command](params || {});
		} else {
			throw('unknown command <span class="command">' + command + '</span> use <span class="command">list</span> to see the list of available commands');
		}
	}

	var refreshCommandsCookies = function() {
		if(history.length > historyMaxSize) {
			history.reverse().pop().reverse();
		//	history.reverse();
		}
		setCookie('history', history.join(","));
	}

	
	var generateHtml = function() {
		if ($('div').is('#' + widgetHtmlId)) {
			$('#' + widgetHtmlId).remove();
		}
		$("body").append('<div id="' + widgetHtmlId + '"><div class="console"><div class="console-content"></div></div><input type="text" class="commandline" /><div class="helper"></div></div>');
		$('#' + widgetHtmlId + " .commandline").focus();
	}

	

	/*--servise--*/
	var extend = function(to, from) {
		for (var key in from)
			if (from.hasOwnProperty(key))
				to[key] = from[key];
		return to;
	}

	var log = function(q) {
		options.debug && console.log(q);
	}

	var echo = function(str, style){
		str = (style == "bold") ? "<b>" + str + "</b>" : str;
		$('.console-content').append(str + "<br>");
	}

	var getCookie = function( name ) {
		var start = document.cookie.indexOf( name + "=" );
		var len = start + name.length + 1;
		if ( (!start) && (name != document.cookie.substring( 0, name.length)) || (start == -1) )
			return null;
		var end = document.cookie.indexOf(';', len);
		if (end == -1) end = document.cookie.length;
		return unescape(document.cookie.substring(len, end));
	}

	var setCookie = function(name, value, expires, path, domain, secure) {
		var today = new Date();
		today.setTime(today.getTime());
		if (expires) {
			expires = expires * 1000 * 60 * 60 * 24;
		}
		var expires_date = new Date( today.getTime() + (expires));
		document.cookie = name + '=' + escape( value ) +
		((expires) ? ';expires='+expires_date.toGMTString() : '' ) + //expires.toGMTString()
		((path) ? ';path=' + path : '' ) +
		((domain) ? ';domain=' + domain : '' ) +
		((secure) ? ';secure' : '' );
	}

	var deleteCookie = function(name, path, domain) {
		if (getCookie(name)) document.cookie = name + '=' +
		((path) ? ';path=' + path : '') +
		((domain) ? ';domain=' + domain : '' ) +
		';expires=Thu, 01-Jan-1970 00:00:01 GMT';
	}
}


var line = new Commandline();
line.init();