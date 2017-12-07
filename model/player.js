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

	// position (int)
		// Nothing == 0
		// President == 1
		// Chancellor == 2
		// Inelligible == 3 (for last rounds president and chancellor)

	// game (*Game)

	// METHODS
	// isElligibleChancellor()
		// return true if elligible to be nominated for Chancellor

const NO_POSITION = 0;
const PRESIDENT = 1;
const CHANCELLOR = 2;
const INELLIGIBLE = 3;

const LIBERAL_ROLE = 0;
const FASCIST_ROLE = 1;
const HITLER_ROLE = 2;

module.exports = {
	NO_POSITION: NO_POSITION,
	PRESIDENT: PRESIDENT,
	CHANCELLOR: CHANCELLOR,
	INELLIGIBLE: INELLIGIBLE,
	LIBERAL_ROLE: LIBERAL_ROLE,
	FASCIST_ROLE: FASCIST_ROLE,
	HITLER_ROLE: HITLER_ROLE,
	Player: function (id_in, name_in, socket_in) {
		this.id = id_in;
		this.name = name_in;
		this.socket = socket_in;

		this.isElligibleChancellor = function () {
			return this.position == NO_POSITION;
		}

		this.isPresident = function () {
			return this.position == PRESIDENT;
		}

		this.isChancellor = function () {
			return this.position == CHANCELLOR;
		}

		this.isHitler = function () {
			return this.role == HITLER_ROLE;
		}

		this.assignRole = function (role_in) {
			if (role_in == LIBERAL_ROLE) {
				this.role = LIBERAL_ROLE;
			} 
			else if (role_in == HITLER_ROLE) {
				this.role = HITLER_ROLE;
			}
			else {
				this.role = FASCIST_ROLE;
			}
		}

		this.makePresident = function () {
			this.position = PRESIDENT;
		}

		this.makeChancellor = function () {
			this.position = CHANCELLOR;
		}

		this.emit = function (type, msg) {
			this.socket.emit(type, msg);
		}
	}
};