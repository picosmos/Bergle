import { useState } from "react";
import { Guess } from "../domain/guess";

type GameResult = "VICTORY" | "VICTORY_WITH_MAP" | "LOSS" | "ONGOING";

/** Class handling storage of guesses */
class GuessStorage {
  static loadAllGuesses(): Record<string, Guess[]> {
    const storedGuesses = localStorage.getItem("guesses");
    if (storedGuesses === null) return {};
    return JSON.parse(storedGuesses);
  }

  static loadGuessesForDay(dayString: string) {
    return this.loadAllGuesses()[dayString] ?? [];
  }

  static updateSavedGuesses(dayString: string, guesses: Guess[]) {
    const allGuesses = this.loadAllGuesses();
    localStorage.setItem(
      "guesses",
      JSON.stringify({
        ...allGuesses,
        [dayString]: guesses,
      })
    );
  }

  static loadAllGameResults(): Record<string, GameResult> {
    const storedGameResults = localStorage.getItem("gameResult");
    if (storedGameResults === null) return {};
    return JSON.parse(storedGameResults);
  }

  static loadGameResultForDay(dayString: string) {
    return this.loadAllGameResults()[dayString] ?? "ONGOING";
  }

  static updateGameResults(dayString: string, gameResult: GameResult) {
    const allGameResults = this.loadAllGameResults();
    localStorage.setItem(
        "gameResult",
        JSON.stringify({
          ...allGameResults,
          [dayString]: gameResult,
        })
    );
  }
}

const calculateGameResult = (guesses: Guess[], maxGuesses: number, usedHint: boolean) => {
  const lastGuessIdx = guesses.length;
  if(lastGuessIdx === 0) {
    return "ONGOING"
  }
  
  const lastGuess = guesses[lastGuessIdx-1];
  if (lastGuess.distance === 0) {
    if(usedHint) {
      return "VICTORY_WITH_MAP";
    }
    return "VICTORY";
  }
  
  if (lastGuessIdx === maxGuesses) {
    return "LOSS";
  }
  return "ONGOING";
};

/** 
 * NOTE: should only be used within useGame
 * - usage multiple places may lead to bugs
 */
export function useGuesses(dayString: string, maxAttempts: number, usedHint: boolean) {
  const [guesses, setGuesses] = useState<Guess[]>(
    GuessStorage.loadGuessesForDay(dayString)
  );
  const [gameResult, setGameResult] = useState<GameResult>(
    GuessStorage.loadGameResultForDay(dayString)
  );

  //const usedHintOrig = usedHint || gameResult === "VICTORY_WITH_MAP";

  const addGuess = (guess: Guess) => {
    const newGuesses = [...guesses, guess];
    setGuesses(newGuesses);
    GuessStorage.updateSavedGuesses(dayString, newGuesses);

    const newGameResult = calculateGameResult(newGuesses, maxAttempts, usedHint);
    GuessStorage.updateGameResults(dayString, newGameResult);
    setGameResult(newGameResult);
  };

  return {
    guesses,
    addGuess,
    gameResult,
    //usedHintOrig
  };
}
