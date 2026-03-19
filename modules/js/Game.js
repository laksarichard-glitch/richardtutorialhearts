/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * RichardTutorialHearts implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

import { PlayerTurn } from "./PlayerTurn.js";
import { logStart } from "./Functions.js";
import { logEnd } from "./Functions.js";

/**
 * We create one State class per declared state on the PHP side, to handle all state specific code here.
 * onEnteringState, onLeavingState and onPlayerActivationChange are predefined names that will be called by the framework.
 * When executing code in this state, you can access the args using this.args
 */
const BgaAnimations = await importEsmLib("bga-animations", "1.x");
const BgaCards = await importEsmLib("bga-cards", "1.x");

export class Game {
  constructor(bga) {
    console.log("richardtutorialhearts constructor");
    this.bga = bga;

    // Declare the State classes
    this.playerTurn = new PlayerTurn(this, bga);
    this.bga.states.register("PlayerTurn", this.playerTurn);

    // Uncomment the next line to show debug informations about state changes in the console. Remove before going to production!
    this.bga.states.logger = console.log;

    // Here, you can init the global variables of your user interface
    // Example:
    // this.myGlobalValue = 0;
  }

  /*
        setup:
        This method must set up the game user interface according to current game situation specified
        in parameters.
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
        "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
    */

  setup(gamedatas) {
    console.log("Starting game setup");
    this.gamedatas = gamedatas;
    // set uop the DOM
    this.setUpDOM(gamedatas);

    // create the animation manager, and bind it to the `game.bgaAnimationsActive()` function
    this.setupManagers();

    this.setupMiniPanel(gamedatas);

    // TODO: fix handStock
    this.handleCards(gamedatas);

    // TODO: Set up your game interface here, according to "gamedatas"

    // Setup game notifications to handle (see "setupNotifications" method below)
    this.setupNotifications();

    console.log("Ending game setup");
  }

  /*
   *
   */
  handleCards(gamedatas) {
    this.handStock.setSelectionMode("single");
    this.handStock.onCardClick = (card) => {
      {
        console.log("onCardClick : card ", card);
        console.log("onCardClick : namestate ", this.gamedatas.gamestate.name);
        if (!card) return; // hmm - should never happen
        switch (this.gamedatas.gamestate.name) {
          case "PlayerTurn":
            // Can play a card
            this.bga.actions.performAction("actPlayCard", { cardId: card.id });

            break;
          case "GiveCards":
            // Can give cards TODO
            break;
          default: {
            this.handStock.unselectAll();
            break;
          }
        }
      }
    };

    this.tableauStocks = [];
    Object.values(gamedatas.players).forEach((player, index) => {
      // add player tableau stock
      this.tableauStocks[player.id] = new BgaCards.LineStock(
        this.cardsManager,
        document.getElementById(`tableau_${player.id}`),
      );
      // TODO: fix tableauStocks
      this.tableauStocks[player.id].addCards([
        { id: index + 10, type: index + 1, type_arg: index + 2 },
      ]);
    });

    // Cards in player's hand
    this.handStock.addCards(Array.from(Object.values(this.gamedatas.hand)));

    // Cards played on table
    for (i in this.gamedatas.cardsontable) {
      var card = this.gamedatas.cardsontable[i];
      var player_id = card.location_arg;
      this.tableauStocks[player_id].addCards([card]);
    }
  }

  /*
   *
   */
  setupMiniPanel(gamedatas) {
    Object.values(gamedatas.players).forEach((player) => {
      // example of setting up players boards
      this.bga.playerPanels.getElement(player.id).insertAdjacentHTML(
        "beforeend",
        `
                <span id="energy-player-counter-${player.id}"></span> Energy
            `,
      );
      const counter = new ebg.counter();
      counter.create(`energy-player-counter-${player.id}`, {
        value: player.energy,
        playerCounter: "energy",
        playerId: player.id,
      });
    });
  }

  /*
   *
   */
  setUpDOM(gamedatas) {
    logStart(this.setUpDOM.name);
    this.bga.gameArea.getElement().insertAdjacentHTML(
      "beforeend",
      `
                <div id="myhand_wrap" class="whiteblock">
                    <b id="myhand_label">${_("My hand")}</b>
                        <div id="myhand">
                        </div>
                    </div>

            `,
    );

    // Example to add a div on the game area
    this.bga.gameArea.getElement().insertAdjacentHTML(
      "beforeend",
      `
            <div id="player-tables"></div>
        `,
    );

    // Setting up player boards
    const numPlayers = Object.keys(gamedatas.players).length;
    Object.values(gamedatas.players).forEach((player, index) => {
      document.getElementById("player-tables").insertAdjacentHTML(
        "beforeend",
        // we generate this html snippet for each player
        `
          <div class="playertable whiteblock playertable_${index}">
              <div class="playertablename" style="color:#${player.color};">${player.name}</div>
              <div id="tableau_${player.id}"/></div>
              <div id="cardswon_${player.id}"/></div>    
          </div>
    `,
      );
    });
    logEnd(this.setUpDOM.name);
  }

  setupManagers() {
    this.animationManager = new BgaAnimations.Manager({
      animationsActive: () => this.bga.gameui.bgaAnimationsActive(),
    });

    const cardWidth = 100;
    const cardHeight = 135;

    // create the card manager
    this.cardsManager = new BgaCards.Manager({
      animationManager: this.animationManager,
      type: "ha-card", // the "type" of our cards in css
      getId: (card) => card.id,

      cardWidth: cardWidth,
      cardHeight: cardHeight,
      cardBorderRadius: "5%",
      setupFrontDiv: (card, div) => {
        div.dataset.type = card.type; // suit 1..4
        div.dataset.typeArg = card.type_arg; // value 2..14
        div.style.backgroundPositionX = `calc(100% / 14 * (${card.type_arg} - 2))`; // 14 is number of columns in stock image minus 1
        div.style.backgroundPositionY = `calc(100% / 3 * (${card.type} - 1))`; // 3 is number of rows in stock image minus 1
        this.bga.gameui.addTooltipHtml(div.id, `tooltip of ${card.type}`);
      },
    });

    // create the stock, in the game setup
    this.handStock = new BgaCards.HandStock(
      this.cardsManager,
      document.getElementById("myhand"),
    );
  }

  /*
        setupNotifications:
        In this method, you associate each of your game notifications with your local method to handle it.
        Note: game notification names correspond to "bga->notify->all" calls in your Game.php file.
    */
  setupNotifications() {
    console.log("notifications subscriptions setup");

    // automatically listen to the notifications, based on the `notif_xxx` function on this class.
    // Uncomment the logger param to see debug information in the console about notifications.
    this.bga.notifications.setupPromiseNotifications({
      logger: console.log,
    });
  }

  // TODO: from this point and below, you can write your game notifications handling methods
  async notif_newHand(args) {
    // We received a new full hand of 13 cards.
    this.handStock.removeAll();
    this.handStock.addCards(Array.from(Object.values(args.hand)));
  }

  async notif_playCard(args) {
    // Play a card on the table
    this.tableauStocks[args.player_id].addCards([args.card]);
  }

  async notif_trickWin(args) {
    // We do nothing here (just wait in order players can view the 4 cards played before they're gone)
  }

  async notif_giveAllCardsToPlayer(args) {
    // Move all cards on table to given table, then destroy them
    const winner_id = args.player_id;
    const cards = Array.from(Object.values(args.cards));
    await this.tableauStocks[winner_id].addCards(cards);
  }
}
