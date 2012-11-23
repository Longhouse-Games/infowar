define(['underscore', 'lib/helper', 'lib/playing_board', 'lib/building_board'],
    function(_, HelperModule, PlayingBoardModule, BuildingBoardModule) {

var PlayingBoard = PlayingBoardModule.PlayingBoard;
var BuildingBoard = BuildingBoardModule.BuildingBoard;
var Position = HelperModule.Position;
var Piece = HelperModule.Piece;

/**
 * The current state of a guerrilla checkers game.
 */
function InfoChess() {
  var me = this;
  me.initialArmies = {};

  me.ROLES = {
    WHITE: 'white',
    BLACK: 'black'
  };

  me.PHASES = {
    SETUP: 'setup',
    DEFENSE: 'defense',
    PAWNCAPTURE: 'pawn-capture',
    MOVE: 'move',
    IW: 'iw',
    GAMEOVER: 'gameover'
  };

  me.currentPhase = me.PHASES.SETUP;
  me.currentRole = me.ROLES.WHITE;

  me.getCurrentPhase = function() {
    return me.currentPhase;
  };

  me.getCurrentRole = function() {
    return me.currentRole;
  };
}

InfoChess.prototype.asDTO = function(role) {
  var dto = {
    currentPhase: this.currentPhase,
    currentRole: this.currentRole,
  };
  if (role && this.board) {
    dto.board = this.board.getViewPieces(role);
  }
  return dto;
};

InfoChess.prototype.fromDTO = function(data) {
  this.currentPhase = data.currentPhase;
  this.currentRole = data.currentRole;
  this.board = new PlayingBoard(data.board);
};

InfoChess.prototype.validateRole = function(role) {
  if (!_.contains(this.ROLES, role)) throw "Invalid role: " + role;
};

InfoChess.prototype.setArmy = function(role, serializedArmy) {
  var me = this;

  this.validateRole(role);
  if (this.currentPhase !== this.PHASES.SETUP) {
    console.log("Current Phase: " + this.currentPhase);
    throw "Initial armies cannot be changed after the setup phase.";
  }

  this.initialArmies[role] = new BuildingBoard(serializedArmy);
  console.log("Got army for " + role + ", saving it");
  var thing = _.select(this.ROLES, function(value) {
    return me.initialArmies[value] === undefined;
  });
  if (thing.length === 0) {
    this.startGame();
  }
};

InfoChess.prototype.startGame = function() {
  this.currentPhase = this.PHASES.MOVE;
  this.currentRole = this.ROLES.WHITE;
  this.board = new PlayingBoard( this.initialArmies[this.ROLES.WHITE], this.initialArmies[this.ROLES.BLACK]);
};

InfoChess.prototype.nextPhase = function() {
  var phase = this.currentPhase;
  var PHASES = this.PHASES;

  var new_phase;

  new_phase = PHASES.MOVE;
  this.nextPlayer();

//   if (phase === PHASES.DEFENSE) {
//     new_phase = PHASES.PAWNCAPTURE;
//   } else if (phase === PHASES.PAWNCAPTURE) {
//     new_phase = PHASES.MOVE;
//   } else if (phase === PHASES.MOVE) {
//     new_phase = PHASES.IW;
//   } else if (phase === PHASE.IW) {
//     new_phase = PHASES.DEFENSE;
//     this.nextPlayer();
//   } else {
//     throw "Invalid phase for nextPhase(): " + phase;
//   }

  this.currentPhase = new_phase;
};

InfoChess.prototype.nextPlayer = function() {
  if (this.currentRole === this.ROLES.WHITE) {
    this.currentRole = this.ROLES.BLACK;
  } else {
    this.currentRole = this.ROLES.WHITE;
  }
};

InfoChess.prototype.verifyPhase = function(phase) {
  return this.getCurrentPhase() === phase;
};

InfoChess.prototype.getWinner = function() {
  return null;
};

InfoChess.prototype.getPieces = function() {
  if (this.pieces) {
    return this.pieces;
  }
  return this.board.getPieces();
}

InfoChess.prototype.getPossibleMoves = function(piece, position) {
  return this.board.getPossibleMoves(piece, position);
};

InfoChess.prototype.move = function(role, src, dest) {
  var result = this.board.move(role, src, dest);

  this.nextPhase();

  return result;
};

return {
  InfoChess: InfoChess
};

});