// Player
	// id (int)

	// name (string)

	// socket (Socket.Io socket type)

	// party (bool)
		// Liberal == true
		// Fascist == false

	// isHitler (bool)
		// Hitler == true
		// Not Hitler == false

	// role (int)
		// Nothing == 0
		// President == 1
		// Chancellor == 2
		// Inelligible == 3 (for last rounds president and chancellor)

	// game (*Game)

	// METHODS
	// isElligibleChancellor()
		// return true if elligible to be nominated for Chancellor

const NO_ROLE = 0;
const PRESIDENT_ROLE = 1;
const CHANCELLOR_ROLE = 2;
const INELLIGIBLE_ROLE = 3;

module.exports = {
	NO_ROLE: NO_ROLE,
	PRESIDENT_ROLE: PRESIDENT_ROLE,
	CHANCELLOR_ROLE: CHANCELLOR_ROLE,
	INELLIGIBLE: INELLIGIBLE_ROLE,
	Player: function (id_in, name_in, socket_in, game_in) {
		this.id = id_in;
		this.name = name_in;
		this.socket = socket_in;
		this.game = game_in;

		this.isElligibleChancellor = function () {
			return this.role == NO_ROLE;
		}
	}
};