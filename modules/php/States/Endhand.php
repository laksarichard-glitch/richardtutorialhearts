<?php

declare(strict_types=1);

namespace Bga\Games\RichardTutorialHearts\States;

use Bga\GameFramework\StateType;
use Bga\Games\RichardTutorialHearts\Game;
use Bga\GameFramework\States\GameState;
use Bga\Games\RichardTutorialHearts\States\NewHand;

class EndHand extends GameState
{
    public function __construct(protected Game $game)
    {
        parent::__construct(
            $game,
            id: 40,
            type: StateType::GAME,
            description: "",
        );
    }

    public function onEnteringState()
    {
        // TODO: implement logic
        return NewHand::class;
    }
}
