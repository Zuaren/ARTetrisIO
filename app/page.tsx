"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Rotate3d,
  Play,
  RefreshCw,
} from "lucide-react";

type TetrisPiece = {
  shape: number[][];
  color: string;
  x: number;
  y: number;
};

const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const INITIAL_SPEED = 800;
const SPEED_INCREMENT = 50;

const pieces: Array<{ shape: number[][]; color: string }> = [
  {
    shape: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    color: "#FF0080",
  }, // T
  { shape: [[1, 1, 1, 1]], color: "#00FF80" }, // I
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#FF8000",
  }, // O
  {
    shape: [
      [1, 1, 1],
      [1, 0, 0],
    ],
    color: "#0080FF",
  }, // L
  {
    shape: [
      [1, 1, 1],
      [0, 0, 1],
    ],
    color: "#8000FF",
  }, // J
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "#FF0000",
  }, // Z
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "#00FF00",
  }, // S
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-8">
        ARTetrisIO
      </h1>
      <Tetris />
    </div>
  );
}

const Tetris = () => {
  const [grid, setGrid] = useState<(string | 0)[][]>(() =>
    Array(GRID_HEIGHT)
      .fill(null)
      .map(() => Array(GRID_WIDTH).fill(0))
  );
  const [currentPiece, setCurrentPiece] = useState<TetrisPiece | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const rotatePiece = () => {
    if (!currentPiece || gameOver || isPaused) return;
    const rotated = currentPiece.shape[0].map((_, i) =>
      currentPiece.shape.map((row) => row[row.length - 1 - i])
    );
    if (canMove(rotated, currentPiece.x, currentPiece.y)) {
      setCurrentPiece({ ...currentPiece, shape: rotated });
    }
  };

  const spawnPiece = () => {
    const pieceTemplate = pieces[Math.floor(Math.random() * pieces.length)];
    const newPiece: TetrisPiece = {
      ...pieceTemplate,
      x:
        Math.floor(GRID_WIDTH / 2) -
        Math.floor(pieceTemplate.shape[0].length / 2),
      y: 0,
    };

    if (!canMove(newPiece.shape, newPiece.x, newPiece.y)) {
      setGameOver(true);
      return;
    }

    setCurrentPiece(newPiece);
  };

  const canMove = (shape: number[][], x: number, y: number): boolean => {
    return shape.every((row, rowIndex) =>
      row.every((cell, colIndex) => {
        if (!cell) return true;
        const newY = y + rowIndex;
        const newX = x + colIndex;
        return (
          newX >= 0 &&
          newX < GRID_WIDTH &&
          newY < GRID_HEIGHT &&
          (newY < 0 || !grid[newY][newX])
        );
      })
    );
  };

  const moveDown = () => {
    if (!currentPiece || gameOver || isPaused) return;
    if (canMove(currentPiece.shape, currentPiece.x, currentPiece.y + 1)) {
      setCurrentPiece({ ...currentPiece, y: currentPiece.y + 1 });
    } else {
      mergePiece();
      checkLines();
      spawnPiece();
    }
  };

  const mergePiece = () => {
    if (!currentPiece) return;
    const newGrid = grid.map((row) => [...row]);
    currentPiece.shape.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell) {
          const y = currentPiece.y + rowIndex;
          const x = currentPiece.x + colIndex;
          if (y >= 0) {
            newGrid[y][x] = currentPiece.color;
          }
        }
      });
    });
    setGrid(newGrid);
  };

  const checkLines = () => {
    let linesCleared = 0;
    const newGrid = grid.filter((row) => {
      const isComplete = row.every((cell) => cell !== 0);
      if (isComplete) linesCleared++;
      return !isComplete;
    });

    while (newGrid.length < GRID_HEIGHT) {
      newGrid.unshift(Array(GRID_WIDTH).fill(0));
    }

    if (linesCleared > 0) {
      const newScore = score + linesCleared * 100 * level;
      setScore(newScore);
      setLevel(Math.floor(newScore / 1000) + 1);
      setGrid(newGrid);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (gameOver) return;
    switch (e.key) {
      case "ArrowLeft":
        if (
          currentPiece &&
          canMove(currentPiece.shape, currentPiece.x - 1, currentPiece.y)
        ) {
          setCurrentPiece({ ...currentPiece, x: currentPiece.x - 1 });
        }
        break;
      case "ArrowRight":
        if (
          currentPiece &&
          canMove(currentPiece.shape, currentPiece.x + 1, currentPiece.y)
        ) {
          setCurrentPiece({ ...currentPiece, x: currentPiece.x + 1 });
        }
        break;
      case "ArrowDown":
        moveDown();
        break;
      case "ArrowUp":
        rotatePiece();
        break;
      case " ":
        setIsPaused(!isPaused);
        break;
    }
  };

  useEffect(() => {
    if (gameOver || isPaused) return;
    if (!currentPiece) spawnPiece();
    const speed = Math.max(INITIAL_SPEED - (level - 1) * SPEED_INCREMENT, 100);
    const gameInterval = setInterval(moveDown, speed);

    const handleKeyboardEvent = (e: KeyboardEvent) => handleKeyPress(e);
    window.addEventListener("keydown", handleKeyboardEvent);

    return () => {
      clearInterval(gameInterval);
      window.removeEventListener("keydown", handleKeyboardEvent);
    };
  }, [currentPiece, gameOver, isPaused, level]);

  const resetGame = () => {
    setGrid(
      Array(GRID_HEIGHT)
        .fill(null)
        .map(() => Array(GRID_WIDTH).fill(0))
    );
    setCurrentPiece(null);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setIsPaused(false);
  };

  const renderGrid = () => {
    const displayGrid = grid.map((row) => [...row]);
    if (currentPiece && !gameOver && !isPaused) {
      currentPiece.shape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell) {
            const y = currentPiece.y + rowIndex;
            const x = currentPiece.x + colIndex;
            if (y >= 0 && y < GRID_HEIGHT && x >= 0 && x < GRID_WIDTH) {
              displayGrid[y][x] = currentPiece.color;
            }
          }
        });
      });
    }

    return displayGrid.map((row, rowIndex) => (
      <div key={rowIndex} className="flex">
        {row.map((cell, colIndex) => (
          <div
            key={colIndex}
            className="w-6 h-6 border border-gray-800 transition-colors duration-100"
            style={{
              backgroundColor: cell || "#1a1a1a",
              boxShadow: cell ? `0 0 10px ${cell}` : "none",
            }}
          />
        ))}
      </div>
    ));
  };

  const Controls = () => (
    <div className="mt-4 grid grid-cols-3 gap-2 w-48">
      <button
        onClick={() =>
          currentPiece && handleKeyPress({ key: "ArrowLeft" } as KeyboardEvent)
        }
        className="p-2 bg-gray-800 rounded hover:bg-gray-700"
      >
        <ArrowLeft className="w-6 h-6 text-gray-300" />
      </button>
      <button
        onClick={() => handleKeyPress({ key: "ArrowDown" } as KeyboardEvent)}
        className="p-2 bg-gray-800 rounded hover:bg-gray-700"
      >
        <ArrowDown className="w-6 h-6 text-gray-300" />
      </button>
      <button
        onClick={() =>
          currentPiece && handleKeyPress({ key: "ArrowRight" } as KeyboardEvent)
        }
        className="p-2 bg-gray-800 rounded hover:bg-gray-700"
      >
        <ArrowRight className="w-6 h-6 text-gray-300" />
      </button>
      <button
        onClick={() => handleKeyPress({ key: "ArrowUp" } as KeyboardEvent)}
        className="p-2 bg-gray-800 rounded hover:bg-gray-700"
      >
        <Rotate3d className="w-6 h-6 text-gray-300" />
      </button>
      <button
        onClick={() => handleKeyPress({ key: " " } as KeyboardEvent)}
        className="p-2 bg-gray-800 rounded hover:bg-gray-700"
      >
        <Play className="w-6 h-6 text-gray-300" />
      </button>
      <button
        onClick={resetGame}
        className="p-2 bg-gray-800 rounded hover:bg-gray-700"
      >
        <RefreshCw className="w-6 h-6 text-gray-300" />
      </button>
    </div>
  );

  return (
    <div className="relative">
      <div className="flex gap-8">
        <div className="bg-gray-900 p-4 rounded-lg shadow-2xl">
          <div className="relative">
            {renderGrid()}
            {(gameOver || isPaused) && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {gameOver ? "Game Over" : "Paused"}
                  </h2>
                  {gameOver && (
                    <button
                      onClick={resetGame}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Play Again
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          <Controls />
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-gray-900 p-4 rounded-lg">
            <h2 className="text-xl font-bold text-purple-400 mb-2">Score</h2>
            <p className="text-3xl font-bold text-white">{score}</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg">
            <h2 className="text-xl font-bold text-purple-400 mb-2">Level</h2>
            <p className="text-3xl font-bold text-white">{level}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
