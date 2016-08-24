$(function(){
	var chat = {
		login: null,
		messages: [],
		last: -1,
		init: function(){
			/*
			//Для хранения сообщений исключительно локально
			var messages = localStorage.getItem('messages');
			if(messages){
				messages = $.parseJSON(messages);
				chat.messages = messages;
				chat.showMessages(messages);
			}
			*/

			$('.send-link').click(function(){
				chat.sendMessage();
				return false;
			});
			$('.send').keypress(function(e){
				if(e.charCode == 13){
					chat.sendMessage();
				}
			});
			$('.login-submit').click(function(){
				chat.auth();
			});
			$('.login-input').keypress(function(e){
				if(e.charCode == 13){
					chat.auth();
				}
			});
		},
		auth: function(){
		    chat.login = $('.login-input').val();
			if(chat.login){
				$('.intro').slideUp();
				chat.getMessages();
				setInterval(function(){chat.getMessages() }, 5000);
			}
		},
		getMessages: function(){
			$.post("ajax.php?a=get", {history: chat.last}, function(r){
				if(r.response){
					r.response = Array.from(r.response);
					if(r.response.length > 0){
						r.response = r.response.map(function(elem){
							if(elem.username == chat.login)
								elem.out = true;
							return elem;
						});
						chat.showMessages(r.response);
						$(window).scrollTop($('body').height());
					}
					
					chat.updateTime();
					
				}
			}, 'json');
			
		},
		compileMessage: function(message){
			return '<div class="message m-' + (message.out ? 'right' : 'left') + ' ' + (message.sending ? 'm-sending' : '') + '">'
        	+ '<div class="avatar grad-blue"><div class="avatar-text">' + (message.out ? 'Я' : message.username.substr(0, 1)) + '</div></div>'
        	+ '<div class="message-text">' + message.text + '</div>'
        	+ '<div class="info">'
        	+ (message.out ? '<div class="status"><i class="fa ' + (message.sending ? 'fa-spinner fa-pulse fa-fw' : 'fa-check') + '"></i></div>' : '')
	        + '<div class="time" data-time=' + message.time + '>' + (message.sending ? 'Отправляется' : '') + '</div>'
	        + '<div class="username"><a href="#">' + message.username + '</a></div>'
	        + '</div></div>';
		},
		showMessage: function(message){
			$('.content').append(chat.compileMessage(message));
			if(message.id && message.id > chat.last){
				chat.last = message.id;
			}
		},
		showMessages: function(messages){
			return messages.map(chat.showMessage);
		},
		sendMessage: function(){
			chat.getMessages();
			var message = {
				text: $('.send').val(),
				out: true,
				time: 0,
				sending: true,
				username: chat.login,
			};
			chat.showMessage(message);
			$('.send').prop('disabled', true);
			$.post("ajax.php?a=send", message, function(r){
				chat.last++;
				$('.send').prop('disabled', false);
				$('.m-sending').find('.time')
					.attr('data-time', r.response.time)
					.html("только что")
					;
				$('.m-sending').find('.status').html('<i class="fa fa-check"></i>');
				$('.m-sending').removeClass('m-sending');
				chat.getMessages();
			}, 'json');
			/*
			//Для хранения сообщений исключительно локально
			message.sending = false;
			chat.messages.push(message);
			localStorage.setItem('messages', JSON.stringify(chat.messages));
			*/
			$('.send').val('');
			$('.send').focus();
			$(window).scrollTop($('body').height());
		},
		updateTime: function(){
			var now = ~~(Date.now() / 1000);
			//console.log(now);
			$('.time').each(function(){
				var time = $(this).attr('data-time');
				if(time){
					var dtime = now - time;
					if(dtime < 60)
						$(this).html(dtime + " секунд назад");
					else if(dtime < 3600)
						$(this).html(~~(dtime / 60) + " минут назад");
					else if(dtime < 3600 * 24)
						$(this).html(~~(dtime / 3600) + " часов назад");
					else{
						time = new Date(time * 1000);
						$(this).html((time.getDay() < 10 ? "0" + time.getDay() : time.getDay()) 
							+ "." 
							+ ((time.getDay() <= 10 ? "0" + (time.getMonth() + 1) : time.getMonth() + 1))
							+ "." 
							+ time.getFullYear());
					}
				}
			});
		},
	};
	chat.init();
});