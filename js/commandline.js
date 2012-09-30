function Commandline( options ) {
	var that = this,
		DEBUG = true,
		isInit = false,
		isVisible = false,
		widgetHtmlId = "siteConsole",
		selector = ' .commandline',
		defaultOptions = {},
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

	/*--- make options ---*/
	for(var option in defaultOptions) {
		this[option] = options && options[option] !== undefined ? options[option] : defaultOptions[option];
	}

	$(document).keypress(function(e){
		var keycode = (e.keyCode ? e.keyCode : e.which);
		if(keycode == 96){
			(!isInit) ? that.init() : (isVisible) ? that.hide() : that.show();
		}
	});

	/*--- public methods ---*/
	this.init = function() {
		try {
			if(!isInit) {
				generateHtml();
				fillHistory();
				addListeners();
				isInit = true;
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
		if (document.cookie.length>0) {
			var html = '',
				isActive = true,
				unique = [],
				search = 'history=',
				sHistory = document.cookie,
				offset = sHistory.indexOf(search);
			if (offset == -1) return;
			offset += search.length;
			end = document.cookie.indexOf(";", offset)
			if (end == -1) end = document.cookie.length;
			sHistory = document.cookie.substring(offset, end);
			history = unescape(sHistory).split(",");
			activeCommandInHistory = history.length;
			//log(activeCommandInHistory);
			/*history.reverse();
			for(i in history) {
				if (unique.indexOf(history[i]) == -1) {
					unique.push(history[i]);
					cl = (isActive) ? "active" : "";
					isActive = false;
					html += '<div style="display:none" class="line ' + cl + '" id="command_' + i + '">' + history[i] + '</div>';
				}
			}
			$(".helper").html(html);*/
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
		})/*.dblclick(function(){ helper(); })*/;

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
		if (isUp) {
			if (history[activeCommandInHistory-1] == undefined) return;
		} else {
			if (history[activeCommandInHistory] == undefined) {$(".commandline").val(""); return;}
		}
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
			history.reverse().pop();
			history.reverse();
		}
		document.cookie = "history=" + escape( history.join(",") ) + ";";
	}

	
	var generateHtml = function() {
		if ($('div').is('#' + widgetHtmlId)) {
			$('#' + widgetHtmlId).remove();
		}
		$("body").append('<div id="' + widgetHtmlId + '"><div class="console"><div class="console-content"></div></div><input type="text" class="commandline" /><div class="helper"></div></div>');
		$('#' + widgetHtmlId + " .commandline").focus();
	}

	

	/*--servise--*/
	var log = function(q) {
		if(!DEBUG) return;
		console.log(q);
	}

	var echo = function(str, style){
		str = (style == "bold") ? "<b>" + str + "</b>" : str;
		$('.console-content').append(str + "<br>");
	}
}


var line = new Commandline();
line.init();