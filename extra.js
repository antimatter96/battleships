/*
	if(timeOutStorage[player2]){
		clearInterval(timeOutStorage[player2]);
	}
*/

/*
	//timeOutStorage[player1] = setInterval(function(){findAPlayerFor(player1)}, 500);
*/

/*
	function findAPlayerFor(player1){
		if(UsersInQueue.size > 1){
			var player2 = UsersInQueue[1];
			if(player2 === player1){
				console.log("Finding for" + player1 + "COLLISION");
			}
			else{
				UsersInQueue = UsersInQueue.delete(1);
				clearInterval(timeOutStorage[player1]);
				socket.to(socketOfUser[player2]).emit('startGame', { otherPlayer: player1 })
				socket.to(socketOfUser[player1]).emit('startGame', { otherPlayer: player2 })
			}
		}
		else{
			console.log("Finding for" + player1 + "Few Players");
		}
	}

	var timeOutStorage = [];
	
*/