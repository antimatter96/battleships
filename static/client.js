$(document).ready(function() {
	//
	//HIDE ALL
	//
	
	var hostname = window.location.hostname;
	if(hostname === "localhost"){
		hostname = "127.0.0.1" + ":" + window.location.port;
	}

	var socket = io.connect(hostname);
	var username = 'Not Choosen';
	
	$('#globalLoading').hide();
	$('#namePrompt').hide();
	$('#joinGame').hide();
	$('#choosePlacement').hide();
	$('#board').hide();
	
	function deleteElement(id){
		let toDelete = document.getElementById(id);
		let iskaParent = toDelete.parentNode;
		iskaParent.removeChild(toDelete);
	}
	
	//===== NAME
	
	if(window.localStorage.getItem('username')){
		username = window.localStorage.getItem('username');
		socket.emit('updatePlayerSocket', { player: username});
		deleteElement('namePrompt');
		$('#joinGame').show();
	}
	else{
		$('#namePrompt').show();
		$('#errorName').text('.');
	}
	
	var lockName = false;
	
	$('#btnSubmitName').on('click',function(){
		$('#errorName').text('.');
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
			deleteElement('namePrompt');
			$('#joinGame').show();
			window.localStorage.setItem('username', data.name);
		}
		else{
			$('#errorName').text( data.msg );
		}
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
			$('#globalLoading').show();
		}
	});
	
	socket.on('lockJoin',function(data){
		$('#errorJoin').text('Wait');
		lockJoin = true;
	});
	
	socket.on('startGame',function(data){
		lockJoin = false;
		deleteElement('joinGame');
		$('#globalLoading').hide();
		$('#choosePlacement').show();
		console.log('Player2 is' + data.otherPlayer);
	})
	
	//========== BOARD INITIALIZATION
	
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
				socket.emit('boardMade' , { player: username, shipPlacement: toSend });
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
					point = JSON.parse(point);
					arrToSend[shipType][i] = point;
					i++;
				}
				else{
					break;
				}
			}
		}
		return arrToSend;
	}
	
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
	
	var lengthOfType = { A:5 , B:4, C:3, D:3, E:2};
	var arrOfI = ['1','2','3','4','5','6','7','8','9','10'];
	var arrOfJ = ['A','B','C','D','E','F','G','H','I','J'];
	
	function addShipClass(type,i,j,horizontal){

		if(horizontal){
			for(var y = j;y<j+lengthOfType[type];y++){
				$('#cell-' + i + y).addClass('ship' + type);
			}
		}
		else{
			for(var x = i; x < i + lengthOfType[type] ; x++){
				$('#cell-' + x + j).addClass('ship' + type);
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

			}
		}
		return true;
	}

	$('.inptXY').change(function(){
		let ship = $(this).data("ship");
		if(locked[ship]){
			classInverser(ship,true);
			$('#errorPlaceShip' + ship).text("Locked");
			return ;
		}
		choicesChanged(ship)
	});
	
	$('.btnRot').click(function(){
		let ship = $(this).data("ship");
		if(locked[ship]){
			classInverser(ship,true);
			$('#errorPlaceShip' + ship).text("Locked");
		}
		hor[ship] = !hor[ship];
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
	
	socket.on('readyResponse',function(data){
		if(data.status === "Error"){
			$('#errorReady').text(data.msg);
		}
		else{
			$('#globalLoading').show();
			cloneAndAppend();
			deleteElement('choosePlacement');
			$('#board').show();
		}
	});
	
	function cloneAndAppend(){
		let toClone = document.getElementById("chooseBoard");
		let cloned = toClone.cloneNode(true);
		let clonedToChange = toClone.cloneNode(true);
		let targetParent = document.getElementById("battleBoard");
		changeId(clonedToChange);
		targetParent.appendChild(cloned);
		targetParent.appendChild(clonedToChange);
	}
	
	function changeId(x){
		if(x.id){
			x.id = "opp-" + x.id;
		}
		x.className = x.className.replace(/ ship[A-E]/,"")
		if(x.childElementCount > 0){
			for(let i = 0; i<x.childElementCount; i++){
				changeId(x.children[i]);
			}
		}
	}
	
	//var se = setInterval(function(){console.log(pointsOfShip);},2000);
	
	//=========== GAMEPLAY

	var myShips = {};
	var oppShips = {A: new Set(), B: new Set(), C: new Set(), D: new Set(), E: new Set()};
	
	var otherPlayerBoard = [null,null,null,null,null,null,null,null,null,null];
	for(let i = 0; i<10; i++){
		otherPlayerBoard[i] = new Array(0,0,0,0,0,0,0,0,0,0);
	}
	
	var myTurn = false;
	
	var lastMove = {};
	
	socket.on('go',function(data){
		if(data.start){
			$('#globalLoading').hide();
			myTurn = true;
		}
		for( let shipType in pointsOfShip){
			myShips[shipType] = new Set(pointsOfShip[shipType]);
		}
	});
	
	$('#btnShoot').click(function(){
		if(myTurn){
			var x = $('#shoti').val();
			var y = $('#shotj').val();
			if( arrOfI.indexOf(x) >-1 && arrOfJ.indexOf(y) >-1 ){
				y = arrOfJ.indexOf(y);
				x = arrOfI.indexOf(x);
				if(otherPlayerBoard[x][y] === 0){
					$('#globalLoading').show();
					socket.emit('makeMove', { player: username, move: { x: x, y: y } });
					lastMove.x = x;
					lastMove.y = y;
				}
				else{
					$('#errorShoot').text("Already");
				}
			}
			else{
				$('#errorShoot').text("Asdasd");
			}
		}
		else{
			$('#errorShoot').text("Tera nahi he");
		}
	});
	
	socket.on('moveMadeByYou',function(data){
		if(data.result === "Hit"){
			myTurn = !myTurn;
			otherPlayerBoard[lastMove.x][lastMove.y] = 1;
			$('#opp-cell-' + lastMove.x + lastMove.y).addClass("hit");
			oppShips[data.extra.partOf].add(JSON.stringify(lastMove));
			if(data.extra.shipDown){
				markShipDown(data.extra.partOf);
				if(data.extra.gameOver){
					console.log("gameOver");
				}
			}
		}
		else if(data.result === "Miss"){
			myTurn = !myTurn;
			otherPlayerBoard[lastMove.x][lastMove.y] = -1;
			$('#opp-cell-' + lastMove.x + lastMove.y).addClass("miss");
		}
		else{
			$('#errorShoot').text("Repeat");
		}
	});
	
	function markShipDown(type){
		let points = oppShips[type];
		let z = points.keys();
		while(!z.done){
			points = z.next();
			points = points.value;
			if(points){
				points = JSON.parse(points);
				$('#opp-cell-' + points.x + points.y).addClass('ship' + type);
			}
			else{
				break;
			}
		}
	}
	
	socket.on('moveMadeByOther',function(data){
		if(data.result === "Hit"){
			myTurn = !myTurn;
			$('#cell-' + data.point.x + data.point.y).addClass("hit");
			if(data.extra.gameOver){
				console.log("gameOver");
			}
		}
		else if(data.result === "Miss"){
			myTurn = !myTurn;
			$('#cell-' + data.point.x + data.point.y).addClass("miss");
		}
		$('#globalLoading').hide();
	});
	
	//=============
	
	$('#tetst').click(function(){
		$('#Ai')[0].value = 1;
		$('#Aj')[0].value = 'A';
		$('#Bi')[0].value = 1;
		$('#Bj')[0].value = 'B';
		$('#Ci')[0].value = 1;
		$('#Cj')[0].value = 'D';
		$('#Di')[0].value = 1;
		$('#Dj')[0].value = 'E';
		$('#Ei')[0].value = 9;
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
		
		$('#btnReady').click();
		
	});
});