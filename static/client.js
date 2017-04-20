$(document).ready(function() {
	
	//
	//HIDE ALL
	//
	
	var socket = io.connect('127.0.0.1:8080');
	var username = 'Not Choosen';
	
	$('#namePrompt').hide();
	$('#joinGame').hide();
	
	//===== NAME
	
	if(window.localStorage.getItem('username')){
		username = window.localStorage.getItem('username');
		socket.emit('updatePlayerSocket', { player: username});
		$('#joinGame').show();
	}
	else{
		$('#namePrompt').show();
		$('#errorName').text('.');
	}
	
	var lockName = false;
	
	$('#btnSubmitName').on('click',function(){
		$('#errorName').text('.');
		console.log("ESS");
		if(lockName){
			$('#errorName').text("Please Wait");
		}
		else{
			var result = validateName($('#inptName').val());	
			if(result === 'OK'){
				localName = true;
				$('#btnSubmitName').addClass('loading');
				socket.emit('addUser', { name: $('#inptName').val() });
			}
			else{
				$('#errorName').text(result);	
			}
		}
	});
	
	socket.on('userAddEvent', function(data){
		lockName = false;
		$('#btnSubmitName').removeClass('loading');
		if(data.msg === 'OK'){
			$('#errorName').text('.');
			$('#namePrompt').hide();
			$('#joinGame').show();
			window.localStorage.setItem('username', data.name);
		}
		else{
			$('#errorName').text( data.msg );
		}
		console.log(data);
	});
	
	
	function validateName(name){
		if(name.length < 5){
			return "Too Short. Minimum 5 characters";
		}
		if(name.length > 25){
			return "Too Long. Maximum 25 characters";
		}
		if(/^\w+$/.test(name)){
			return "OK";
		}
		else{
			return "Please Choose alphabets,numbers or '_'";
		}
	}
	
	//
	
	//========= JOIN
	
	var lockJoin = false;
	
	$('#btnJoin').click(function(){
		$('#errorJoin').text('.');
		if(lockJoin){
			$('#errorJoin').text("Wait");
		}
		else{
			lockJoin = true;
			socket.emit('join' , { player: username });
		}
	});
	
	socket.on('lockJoin',function(data){
		$('#errorJoin').text('Wait');
		lockJoin = true;
	})
	socket.on('startGame',function(data){
		lockJoin = false;
		$('#errorJoin').text('.');
		$('#joinGame').hide();
		console.log('Player2' + data.otherPlayer);
	})
	
	//========== BOARD INITIALIZATION
	
	$('#joinGame').hide();
	
	var lockReady = false;
	var boardValid = false;
	
	$('#btnReady').click(function(){
		$('#errorReady').text('.');
		if(lockReady){
			$('#errorReady').text("Wait");
		}
		else{
			lockReady = true;
			socket.emit('boardMade' , { player: username, shipPlacement: "asdds"});
		}
	});
	
	socket.on('readyResponse',function(data){
		if(data.status === "Error"){
			$('#errorReady').text(data.msg);
		}
	})
	
	/*
	var clearBoard = function(){
		for(var i=0;i<9;i++){
			for(var j=0;j<9;j++){
				$("cell-" + i + j).removeClass('selected');
			}
		}
	}
	*/
	
	var lengthOfType = { A:5 , B:4, C:3, D:3, E:2};
	var arrOfI = ['1','2','3','4','5','6','7','8','9','10'];
	var arrOfJ = ['A','B','C','D','E','F','G','H','I','J'];
	
	function addShipClass(type,i,j,horizontal){
		console.log('i : ' + i + "   j : "   + j);
		if(horizontal){
			for(var y = j;y<j+lengthOfType[type];y++){
				$('#cell-' + i + y).addClass('ship' + type);
				//console.log('#cell-' + i + y);
			}
		}
		else{
			for(var x = i; x < i + lengthOfType[type] ; x++){
				$('#cell-' + x + j).addClass('ship' + type);
				//console.log('#cell-' + x + j);
			}
		}
	}
	
	var playerBoard = new Array(null,null,null,null,null,null,null,null,null,null);
	for(var i=0;i<10;i++){
		playerBoard[i] = new Array(0,0,0,0,0,0,0,0,0,0);
	}
	
	var pointsOfShip = {A: new Set(), B: new Set(), C: new Set(), D: new Set(), E: new Set()};
	
	var hor = { A:false, B:false, C:false, D:false, E:false};
	var placedBefore = { A:false, B:false, C:false, D:false, E:false};
	
	function addPointsToShip(type,i,j,horizontal){
		var points = pointsOfShip[type];
		points.clear();
		if(horizontal){
			for(var y = j; y<j+lengthOfType[type]; y++){
				points.add(JSON.stringify({'x':i,'y':y}));
			}
		}
		else{
			for(var x = i; x < i + lengthOfType[type] ; x++){
				points.add(JSON.stringify({'x':x,'y':j}));
			}
		}
	}
	
	function removeShipCLass(type){
		var points = pointsOfShip[type];
		var z = points.keys();
		while(!z.done){
			points = z.next();
			points = points.value;
			if(points){
				points = JSON.parse(points);
				$('#cell-' + points.x + points.y).removeClass('ship' + type);
				//console.log(points);
			}
			else{
				break;
			}
		}
	}
	
	function removePoints(type){
		pointsOfShip[type] = new Set();
	}
	
	function choicesChanged(ship){
		var valI = $('#' + ship + 'i').val();
		var valJ = $('#' + ship + 'j').val();
		$('#errorPlaceShip' + ship).text(".");
		var possible = true;
		if(valI && valJ){
			if(arrOfI.indexOf(valI) >-1 && arrOfJ.indexOf(valJ) >-1 ){
				possible = checkBounds(valI,valJ,ship,hor[ship]);
				if(possible){
					if(placedBefore[ship]){
						removeShipCLass(ship);
						removePoints(ship);
					}
					placedBefore[ship] = true;
					addPointsToShip(ship,arrOfI.indexOf(valI),arrOfJ.indexOf(valJ),hor[ship]);
					addShipClass(ship,arrOfI.indexOf(valI),arrOfJ.indexOf(valJ),hor[ship]);
				}
				else{
					$('#errorPlaceShip' + ship).text("Out of bounds");
				}
			}
		}
	}
	
	function checkBounds(valI,valJ,ship,horizontal){
		if(horizontal){
			if( arrOfJ.indexOf(valJ) + lengthOfType[ship] > 10){
				return false;
			}
		}
		else{
			if( arrOfI.indexOf(valI) + lengthOfType[ship] > 10){
				return false;
			}
		}
		return true;
	}
	
	$('.inptXY').change(function(){
		var ship = $(this).data("ship");
		choicesChanged(ship)
	});
	
	$('.btnRot').click(function(){
		var ship = $(this).data("ship");
		hor[ship] = ~hor[ship];
		choicesChanged(ship);
	});
	
	
	//var se = setInterval(function(){console.log(pointsOfShip);},2000);
	
	//=========== 
	
	$("form").submit(function(event) {
		event.preventDefault();
	});
  
  /*
	$("#join").attr('disabled', 'disabled'); 
  
  if ($("#name").val() === "") {
	  $("#join").attr('disabled', 'disabled');
  }

  //enter screen
  $("#nameForm").submit(function() {
    var name = $("#name").val();
    var device = "desktop";
    if (navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i)) {
      device = "mobile";
    }
    if (name === "" || name.length < 2) {
      $("#errors").empty();
      $("#errors").append("Please enter a name");
      $("#errors").show();
    } else {
      socket.emit("joinserver", name, device);
      toggleNameForm();
      toggleChatWindow();
      $("#msg").focus();
    }
  });

  $("#name").keypress(function(e){
    var name = $("#name").val();
    if(name.length < 2) {
      $("#join").attr('disabled', 'disabled'); 
    } else {
      $("#errors").empty();
      $("#errors").hide();
      $("#join").removeAttr('disabled');
    }
  });

  //main chat screen
  $("#chatForm").submit(function() {
    var msg = $("#msg").val();
    if (msg !== "") {
      socket.emit("send", new Date().getTime(), msg);
      $("#msg").val("");
    }
  });

  //'is typing' message
  var typing = false;
  var timeout = undefined;

  function timeoutFunction() {
    typing = false;
    socket.emit("typing", false);
  }

  $("#msg").keypress(function(e){
    if (e.which !== 13) {
      if (typing === false && myRoomID !== null && $("#msg").is(":focus")) {
        typing = true;
        socket.emit("typing", true);
      } else {
        clearTimeout(timeout);
        timeout = setTimeout(timeoutFunction, 5000);
      }
    }
  });

  socket.on("isTyping", function(data) {
    if (data.isTyping) {
      if ($("#"+data.person+"").length === 0) {
        $("#updates").append("<li id='"+ data.person +"'><span class='text-muted'><small><i class='fa fa-keyboard-o'></i> " + data.person + " is typing.</small></li>");
        timeout = setTimeout(timeoutFunction, 5000);
      }
    } else {
      $("#"+data.person+"").remove();
    }
  });

  $("#showCreateRoom").click(function() {
    $("#createRoomForm").toggle();
  });

  $("#createRoomBtn").click(function() {
    var roomExists = false;
    var roomName = $("#createRoomName").val();
    socket.emit("check", roomName, function(data) {
      roomExists = data.result;
       if (roomExists) {
          $("#errors").empty();
          $("#errors").show();
          $("#errors").append("Room <i>" + roomName + "</i> already exists");
        } else {      
        if (roomName.length > 0) { //also check for roomname
          socket.emit("createRoom", roomName);
          $("#errors").empty();
          $("#errors").hide();
          }
        }
    });
  });

  $("#rooms").on('click', '.joinRoomBtn', function() {
    var roomName = $(this).siblings("span").text();
    var roomID = $(this).attr("id");
    socket.emit("joinRoom", roomID);
  });

  $("#rooms").on('click', '.removeRoomBtn', function() {
    var roomName = $(this).siblings("span").text();
    var roomID = $(this).attr("id");
    socket.emit("removeRoom", roomID);
    $("#createRoom").show();
  }); 

  $("#leave").click(function() {
    var roomID = myRoomID;
    socket.emit("leaveRoom", roomID);
    $("#createRoom").show();
  });

  $("#people").on('click', '.whisper', function() {
    var name = $(this).siblings("span").text();
    $("#msg").val("w:"+name+":");
    $("#msg").focus();
  });

//socket-y stuff
socket.on("exists", function(data) {
  $("#errors").empty();
  $("#errors").show();
  $("#errors").append(data.msg + " Try <strong>" + data.proposedName + "</strong>");
    toggleNameForm();
    toggleChatWindow();
});

socket.on("history", function(data) {
  if (data.length !== 0) {
    $("#msgs").append("<li><strong><span class='text-warning'>Last 10 messages:</li>");
    $.each(data, function(data, msg) {
      $("#msgs").append("<li><span class='text-warning'>" + msg + "</span></li>");
    });
  } else {
    $("#msgs").append("<li><strong><span class='text-warning'>No past messages in this room.</li>");
  }
});

  socket.on("update", function(msg) {
    $("#msgs").append("<li>" + msg + "</li>");
  });

  socket.on("update-people", function(data){
    //var peopleOnline = [];
    $("#people").empty();
    $('#people').append("<li class=\"list-group-item active\">People online <span class=\"badge\">"+data.count+"</span></li>");
    $.each(data.people, function(a, obj) {
      if (!("country" in obj)) {
        html = "";
      } else {
        html = "<img class=\"flag flag-"+obj.country+"\"/>";
      }
      $('#people').append("<li class=\"list-group-item\"><span>" + obj.name + "</span> <i class=\"fa fa-"+obj.device+"\"></i> " + html + " <a href=\"#\" class=\"whisper btn btn-xs\">whisper</a></li>");
      //peopleOnline.push(obj.name);
    });

  });

  socket.on("chat", function(msTime, person, msg) {
    
	}
  });

  socket.on("whisper", function(msTime, person, msg) {
    if (person.name === "You") {
      s = "whisper"
    } else {
      s = "whispers"
    }
    $("#msgs").append("<li><strong><span class='text-muted'>" + timeFormat(msTime) + person.name + "</span></strong> "+s+": " + msg + "</li>");
  });

  socket.on("roomList", function(data) {
    $("#rooms").text("");
    $("#rooms").append("<li class=\"list-group-item active\">List of rooms <span class=\"badge\">"+data.count+"</span></li>");
     if (!jQuery.isEmptyObject(data.rooms)) { 
      $.each(data.rooms, function(id, room) {
        var html = "<button id="+id+" class='joinRoomBtn btn btn-default btn-xs' >Join</button>" + " " + "<button id="+id+" class='removeRoomBtn btn btn-default btn-xs'>Remove</button>";
        $('#rooms').append("<li id="+id+" class=\"list-group-item\"><span>" + room.name + "</span> " + html + "</li>");
      });
    } else {
      $("#rooms").append("<li class=\"list-group-item\">There are no rooms yet.</li>");
    }
  });

  socket.on("sendRoomID", function(data) {
    myRoomID = data.id;
  });

  socket.on("disconnect", function(){
    $("#msgs").append("<li><strong><span class='text-warning'>The server is not available</span></strong></li>");
    $("#msg").attr("disabled", "disabled");
    $("#send").attr("disabled", "disabled");
  });
  
	socket.on("gameJoin", function(data){
		initializeGame(data);
	})
	
	socket.on("shot", function(data){
		
	})
	
	function shipsChoosen(){
		socket.emit('')
	}
	*/

});
