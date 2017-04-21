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
	
	//$('#joinGame').hide();
	
	var lockReady = false;
	var boardValid = false;
	
	$('#btnReady').click(function(){
		$('#errorReady').text('.');
		if(lockReady){
			$('#errorReady').text("Wait");
		}
		else{
			boardValid = boardIsValid();
			if(boardValid){
				lockReady = true;
				for(var shipType in locked){
					locked[shipType] = true;
				}
				var toSend = makeToSend();
				socket.emit('boardMade' , { player: username, shipPlacement: toSend});
			}
			else{
				$('#errorReady').text('Invlid Board');
			}
		}
	});
	
	function makeToSend(){
		var arrToSend = {};
		for(var shipType in pointsOfShip){
			arrToSend[shipType] = {}
			var points = pointsOfShip[shipType];
			var z = points.keys();
			var i = 0;
			while(!z.done){
				var point = z.next();
				var point = point.value;
				if(point){
					//console.log(point);
					point = JSON.parse(point);
					arrToSend[shipType][i] = point;
					i++;
					//console.log(points);
				}
				else{
					break;
				}
			}
			//console.log(arrToSend[shipType]);
		}
		return arrToSend;
	}
	
	socket.on('readyResponse',function(data){
		console.log(data);
		if(data.status === "Error"){
			$('#errorReady').text(data.msg);
		}
	})
	
	function boardIsValid(){
		for(var shipType in pointsOfShip){
			if(pointsOfShip[shipType].size !== lengthOfType[shipType]) {
				return false;
			}
			if(!placedBefore[shipType]){
				return false;
			}
		}
		return true;
	}
	
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
	var locked = { A:false, B:false, C:false, D:false, E:false};
	
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
	
	function removeShip(type){
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
		pointsOfShip[type] = new Set();
	}
	
	function choicesChanged(ship){
		var valI = $('#' + ship + 'i').val();
		var valJ = $('#' + ship + 'j').val();
		classInverser(ship,false);
		$('#errorPlaceShip' + ship).text(".");
		var possibleBounds = true;
		var possibleOverlap = true;
		if(valI && valJ){
			if(arrOfI.indexOf(valI) >-1 && arrOfJ.indexOf(valJ) >-1 ){
				possibleBounds = checkBounds(valI,valJ,ship,hor[ship]);
				if(possibleBounds){
					possibleOverlap = checkOverlap(valI,valJ,ship,hor[ship]);
					if(possibleOverlap){
						if(placedBefore[ship]){
							removeShip(ship);
						}
						placedBefore[ship] = true;
						addPointsToShip(ship,arrOfI.indexOf(valI),arrOfJ.indexOf(valJ),hor[ship]);
						addShipClass(ship,arrOfI.indexOf(valI),arrOfJ.indexOf(valJ),hor[ship]);
					}
					else{
						classInverser(ship,true);
						$('#errorPlaceShip' + ship).text("Overlapping Ships");
					}
					
				}
				else{
					classInverser(ship,true);
					$('#errorPlaceShip' + ship).text("Out of bounds");
				}
			}
			else{
				classInverser(ship,true);
				$('#errorPlaceShip' + ship).text("Inavlid Entries");
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
	
	function checkOverlap(valI,valJ,ship,horizontal){
		j = arrOfJ.indexOf(valJ);
		i = arrOfI.indexOf(valI);
		var tempPoints = new Set();
		if(horizontal){
			for(var y = j; y<j+lengthOfType[ship]; y++){
				tempPoints.add(JSON.stringify({'x':i,'y':y}));
			}
		}
		else{
			for(var x = i; x < i + lengthOfType[ship] ; x++){
				tempPoints.add(JSON.stringify({'x':x,'y':j}));
			}
		}
		for(var shipType in pointsOfShip){
			if( shipType != ship){
			
				let intersection = new Set([...pointsOfShip[shipType]].filter(x => tempPoints.has(x)));
				if(intersection.size > 0){
					return false;
				}
				//console.log("intersection", intersection);
				
			}
		}
		return true;
	}

	$('.inptXY').change(function(){
		var ship = $(this).data("ship");
		if(locked[ship]){
			classInverser(ship,true);
			$('#errorPlaceShip' + ship).text("Locked");
			return ;
		}
		choicesChanged(ship)
	});
	
	$('.btnRot').click(function(){
		var ship = $(this).data("ship");
		if(locked[ship]){
			classInverser(ship,true);
			$('#errorPlaceShip' + ship).text("Locked");
			return ;
		}
		hor[ship] = ~hor[ship];
		if(hor[ship]){
			$('#btnRotIndic' + ship).text("Currently Horizontal");
		}
		else{
			$('#btnRotIndic' + ship).text("Currently Vertical");
		}
		choicesChanged(ship);
	});
	
	$('.btnDrop').click(function(){
		var ship = $(this).data("ship");
		if(locked[ship]){
			classInverser(ship,true);
			$('#errorPlaceShip' + ship).text("Already Locked");
		}
		else{
			if(placedBefore[ship]){
				this.classList.remove('btn-primary');
				this.classList.add('btn-danger');
				locked[ship] = true;
			}
			else{
				classInverser(ship,true);
				$('#errorPlaceShip' + ship).text("Please Place before locking");
			}
			
		}
	});
	
	function classInverser(ship,errorOn){
		if(errorOn){
			$('#errorPlaceShip' + ship).addClass("label-danger");
			$('#errorPlaceShip' + ship).removeClass("label-default");
		}
		else{
			$('#errorPlaceShip' + ship).removeClass("label-danger");
			$('#errorPlaceShip' + ship).addClass("label-default");
		}
	}
	
	//var se = setInterval(function(){console.log(pointsOfShip);},2000);
	
	//=========== 
	
	$("form").submit(function(event) {
		event.preventDefault();
	});
  
	$('#tetst').click(function(){
		$('#Ai')[0].value = 1;
		$('#Aj')[0].value = 'A';
		$('#Bi')[0].value = 1;
		$('#Bj')[0].value = 'B';
		$('#Ci')[0].value = 1;
		$('#Cj')[0].value = 'D';
		$('#Di')[0].value = 1;
		$('#Dj')[0].value = 'E';
		$('#Ei')[0].value = 1;
		$('#Ej')[0].value = 'F';

		$('#btnRotA').click();
		$('#btnRotA').click();
		$('#btnRotB').click();
		$('#btnRotB').click();
		$('#btnRotC').click();
		$('#btnRotC').click();
		$('#btnRotD').click();
		$('#btnRotD').click();
		$('#btnRotE').click();
		$('#btnRotE').click();
	});
});