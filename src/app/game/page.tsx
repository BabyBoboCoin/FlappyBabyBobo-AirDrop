"use client";

import { useEffect, useRef, useState } from 'react';
import WalletConnect from './WalletConnect'; // Adjust the import path since it's in the same folder

const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
  });
  const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'restart'
  const [walletAddress, setWalletAddress] = useState<string>('');
  const jumpSoundRef = useRef<HTMLAudioElement | null>(null);
  const gameOverSoundRef = useRef<HTMLAudioElement | null>(null);
  const coinSoundRef = useRef<HTMLAudioElement | null>(null);
  const weedSoundRef = useRef<HTMLAudioElement | null>(null);
  const redBullSoundRef = useRef<HTMLAudioElement | null>(null);
  const shieldSoundRef = useRef<HTMLAudioElement | null>(null);
  const [collectedCoins, setCollectedCoins] = useState(0); // Use state to manage coin count
  const [specialItemActive, setSpecialItemActive] = useState(false); // Use state to manage special item activation
  const [specialItemCountdown, setSpecialItemCountdown] = useState(0); // Use state for countdown
  const [speedItemActive, setSpeedItemActive] = useState(false); // Use state to manage speed item activation
  const [speedItemCountdown, setSpeedItemCountdown] = useState(0); // Use state for countdown
  const [shieldActive, setShieldActive] = useState(false); // Use state to manage shield activation

  const currentSpeed = useRef(2); // Normal speed
  const slowSpeed = 2;
  const fastSpeed = 6;
  const normalSpeed = 3;

  // Function to handle wallet connect
  const handleConnect = (address: string) => {
    console.log(`Wallet connected: ${address}`); // Debugging
    setWalletAddress(address);
  };

  useEffect(() => {
    console.log(`Game State: ${gameState}`); // Debugging game state

    jumpSoundRef.current = new Audio('/sounds/jump.mp3');
    gameOverSoundRef.current = new Audio('/sounds/gameover.mp3');
    coinSoundRef.current = new Audio('/sounds/coin.mp3');
    weedSoundRef.current = new Audio('/sounds/Weed.mp3');
    redBullSoundRef.current = new Audio('/sounds/RedBull.mp3');
    shieldSoundRef.current = new Audio('/sounds/shield.mp3');

    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!canvas || !context) return;

    // Set canvas size for high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight * 0.6; // 60vh
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    context.scale(dpr, dpr);

    const bird = {
      x: 100, // Adjusted position to be more centered
      y: 150,
      radius: 0, // Will be set when the image loads
      gravity: 0.2,
      lift: -5,
      velocity: 0
    };

    let pipes = [];
    let coins = [];
    let specialItems = [];
    let speedItems = [];
    let shieldItems = [];
    let frame = 0;
    const pipeWidth = 30;
    const initialPipeGap = 400; // Initial gap between pipes
    const minPipeGap = 150; // Minimum gap between pipes
    let pipeGap = initialPipeGap;
    const pipeFrequency = 150; // frames between pipes
    const itemFrequency = 500; // frames between item spawns

    const babyBoboImage = new Image();
    babyBoboImage.src = '/images/BabyBobo-Flying.png'; // Ensure this path is correct

    const gameOverImage = new Image();
    gameOverImage.src = '/images/gameover.png';

    const specialItemImage = new Image();
    specialItemImage.src = '/images/Weed.png'; // Green item image

    const speedItemImage = new Image();
    speedItemImage.src = '/images/RedBull.png'; // White item image

    const shieldItemImage = new Image();
    shieldItemImage.src = '/images/shield.png'; // Orange item image

    const shieldOverlayImage = new Image();
    shieldOverlayImage.src = '/images/Shield.png'; // Shield overlay image

    const images = [babyBoboImage, gameOverImage, specialItemImage, speedItemImage, shieldItemImage, shieldOverlayImage];
    let imagesLoaded = 0;

    const onImageLoad = () => {
      imagesLoaded++;
      if (imagesLoaded === images.length) {
        startGame();
      }
    };

    images.forEach((image) => {
      image.onload = onImageLoad;
      image.onerror = () => {
        console.error('Failed to load image:', image.src);
      };
    });

    const startGame = () => {
      const imageRadius = Math.max(babyBoboImage.naturalWidth, babyBoboImage.naturalHeight) / 2;
      bird.radius = imageRadius;

      const drawBird = () => {
        context.drawImage(babyBoboImage, bird.x - babyBoboImage.naturalWidth / 2, bird.y - babyBoboImage.naturalHeight / 2);
        if (shieldActive) {
          const shieldSize = bird.radius * 2.5;
          context.drawImage(shieldOverlayImage, bird.x - shieldSize / 2, bird.y - shieldSize / 2, shieldSize, shieldSize);
        }
      };

      const drawPipes = () => {
        pipes.forEach(pipe => {
          context.fillStyle = 'green';
          context.fillRect(pipe.x, pipe.y, pipeWidth, pipe.height);
          context.fillRect(pipe.x, pipe.y + pipe.height + pipeGap, pipeWidth, canvasHeight - pipe.y - pipe.height - pipeGap);
          pipe.x -= currentSpeed.current;
        });

        pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);

        if (frame % pipeFrequency === 0) {
          const pipeHeight = Math.random() * (canvasHeight / 2);
          pipes.push({
            x: canvasWidth,
            y: 0,
            height: pipeHeight
          });

          // Add coins at random positions along the pipe gap
          const coinY = Math.random() * (canvasHeight - pipeGap) + pipeHeight;
          coins.push({
            x: canvasWidth,
            y: coinY,
            radius: 10 // Radius of the coin
          });
        }
      };

      const drawCoins = () => {
        context.fillStyle = 'yellow';
        coins.forEach(coin => {
          context.beginPath();
          context.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
          context.fill();
          coin.x -= currentSpeed.current;
        });

        coins = coins.filter(coin => coin.x + coin.radius > 0);
      };

      const drawSpecialItems = () => {
        specialItems.forEach(item => {
          context.drawImage(specialItemImage, item.x - item.radius, item.y - item.radius, item.radius * 2, item.radius * 2);
          item.x -= currentSpeed.current;
        });

        specialItems = specialItems.filter(item => item.x + item.radius > 0);
      };

      const drawSpeedItems = () => {
        speedItems.forEach(item => {
          context.drawImage(speedItemImage, item.x - item.radius, item.y - item.radius, item.radius * 2, item.radius * 2);
          item.x -= currentSpeed.current;
        });

        speedItems = speedItems.filter(item => item.x + item.radius > 0);
      };

      const drawShieldItems = () => {
        shieldItems.forEach(item => {
          context.drawImage(shieldItemImage, item.x - item.radius, item.y - item.radius, item.radius * 2, item.radius * 2);
          item.x -= currentSpeed.current;
        });

        shieldItems = shieldItems.filter(item => item.x + item.radius > 0);
      };

      const checkCollision = () => {
        if (bird.y + bird.radius > canvasHeight || bird.y - bird.radius < 0) {
          if (shieldActive) {
            setShieldActive(false);
            playShieldSound();
            return false; // Shield protects from collision
          }
          console.log("Collision with ground or ceiling");
          return true;
        }

        for (let pipe of pipes) {
          const inPipeXRange = bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + pipeWidth;
          const inPipeYRange = bird.y - bird.radius < pipe.y + pipe.height || bird.y + bird.radius > pipe.y + pipe.height + pipeGap;
          if (inPipeXRange && inPipeYRange) {
            if (shieldActive) {
              setShieldActive(false);
              playShieldSound();
              return false; // Shield protects from collision
            }
            console.log("Collision with pipe");
            return true;
          }
        }
        return false;
      };

      const checkCoinCollection = () => {
        coins = coins.filter(coin => {
          const distX = bird.x - coin.x;
          const distY = bird.y - coin.y;
          const distance = Math.sqrt(distX * distX + distY * distY);

          if (distance < bird.radius + coin.radius) {
            setCollectedCoins(prevCoins => prevCoins + 1);
            playCoinSound();
            return false; // Coin is collected
          }
          return true; // Coin remains on the screen
        });
      };

      const checkSpecialItemCollection = () => {
        specialItems = specialItems.filter(item => {
          const distX = bird.x - item.x;
          const distY = bird.y - item.y;
          const distance = Math.sqrt(distX * distX + distY * distY);

          if (distance < bird.radius + item.radius) {
            if (speedItemActive) {
              setSpeedItemActive(false);
              setSpeedItemCountdown(0);
            }
            setSpecialItemActive(true);
            setSpecialItemCountdown(10);
            playWeedSound();
            return false; // Special item is collected
          }
          return true; // Special item remains on the screen
        });
      };

      const checkSpeedItemCollection = () => {
        speedItems = speedItems.filter(item => {
          const distX = bird.x - item.x;
          const distY = bird.y - item.y;
          const distance = Math.sqrt(distX * distX + distY * distY);

          if (distance < bird.radius + item.radius) {
            if (specialItemActive) {
              setSpecialItemActive(false);
              setSpecialItemCountdown(0);
            }
            setSpeedItemActive(true);
            setSpeedItemCountdown(10);
            playRedBullSound();
            return false; // Speed item is collected
          }
          return true; // Speed item remains on the screen
        });
      };

      const checkShieldItemCollection = () => {
        shieldItems = shieldItems.filter(item => {
          const distX = bird.x - item.x;
          const distY = bird.y - item.y;
          const distance = Math.sqrt(distX * distX + distY * distY);

          if (distance < bird.radius + item.radius) {
            setShieldActive(true);
            playShieldSound();
            return false; // Shield item is collected
          }
          return true; // Shield item remains on the screen
        });
      };

      const gameLoop = () => {
        context.clearRect(0, 0, canvasWidth, canvasHeight);

        if (gameState === 'playing') {
          drawBird();
          drawPipes();
          drawCoins();
          drawSpecialItems();
          drawSpeedItems();
          drawShieldItems();

          bird.velocity += bird.gravity;
          bird.y += bird.velocity;

          if (checkCollision()) {
            console.log("Game over: Collision detected");
            setGameState('restart');
            playGameOverSound();
            if (score > highScore) {
              console.log("New high score achieved:", score);
              setHighScore(score);
              localStorage.setItem('highScore', score.toString());
              if (walletAddress) {
                submitHighScore(walletAddress, score);
              }
            }
            return;
          }

          checkCoinCollection();
          checkSpecialItemCollection();
          checkSpeedItemCollection();
          checkShieldItemCollection();

          frame++;
          const newScore = Math.floor(frame / 10);
          setScore(newScore); // Update score based on distance traveled

          // Decrease the gap between pipes over time
          if (pipeGap > minPipeGap && frame % 300 === 0) { // Adjust the frequency of gap reduction
            pipeGap -= 5; // Adjust the decrement value
          }

          // Spawn special items, speed items, or shield items
          if (frame % itemFrequency === 0) {
            const itemY = Math.random() * (canvasHeight - 40) + 20; // Random position within canvas
            const spawnItemType = Math.random();

            if (spawnItemType < 0.33 && speedItems.length === 0) {
              speedItems.push({
                x: canvasWidth,
                y: itemY,
                radius: 20 // Increased radius of the speed item
              });
            } else if (spawnItemType < 0.66 && specialItems.length === 0) {
              specialItems.push({
                x: canvasWidth,
                y: itemY,
                radius: 20 // Increased radius of the special item
              });
            } else if (shieldItems.length === 0) {
              shieldItems.push({
                x: canvasWidth,
                y: itemY,
                radius: 20 // Increased radius of the shield item
              });
            }
          }

          context.fillStyle = 'white';
          context.font = '20px Arial';
          context.fillText(`Score: ${newScore}m`, canvasWidth - 150, 30); // Display score on the right
          context.fillText(`Coins: ${collectedCoins}`, canvasWidth - 150, 60); // Display collected coins

          if (specialItemActive) {
            context.fillText(`Slow Time: ${specialItemCountdown}s`, canvasWidth - 150, 90); // Display slow time countdown
          }

          if (speedItemActive) {
            context.fillText(`Fast Time: ${speedItemCountdown}s`, canvasWidth - 150, 120); // Display fast time countdown
          }

          if (shieldActive) {
            context.fillText(`Shield: Active`, canvasWidth - 150, 150); // Display shield status
          }

          requestAnimationFrame(gameLoop);
        } else if (gameState === 'start') {
          context.fillStyle = 'rgba(0, 0, 0, 0.5)';
          context.fillRect(0, 0, canvasWidth, canvasHeight);
          context.fillStyle = 'white';
          context.textAlign = 'center';
          context.font = '30px CHIBOLD';
          context.fillText('Press Space or Click to Start', canvasWidth / 2, canvasHeight / 2);
          requestAnimationFrame(gameLoop); // Keep the loop running to listen for state changes
        } else if (gameState === 'restart') {
          context.fillStyle = 'rgba(0, 0, 0, 0.5)';
          context.fillRect(0, 0, canvasWidth, canvasHeight);
          
          const gameOverImageWidth = gameOverImage.width * 0.5;
          const gameOverImageHeight = gameOverImage.height * 0.5;
          context.drawImage(gameOverImage, canvasWidth / 2 - gameOverImageWidth / 2, canvasHeight / 2 - gameOverImageHeight / 2 - 150, gameOverImageWidth, gameOverImageHeight); // Draw the smaller game over image

          context.fillStyle = 'white';
          context.textAlign = 'center';
          context.font = '30px CHIBOLD';
          context.fillText(`Game Over! Score: ${score}m`, canvasWidth / 2, canvasHeight / 2 - 30);
          context.fillText(`High Score: ${highScore}m`, canvasWidth / 2, canvasHeight / 2);
          context.fillText(`Coins Collected: ${collectedCoins}`, canvasWidth / 2, canvasHeight / 2 + 30);
          context.fillText('Press "R" to Restart', canvasWidth / 2, canvasHeight / 2 + 60);
          requestAnimationFrame(gameLoop); // Keep the loop running to listen for state changes
        }
      };

      const resetGame = () => {
        bird.y = 150;
        bird.velocity = 0;
        pipes = [];
        coins = [];
        specialItems = [];
        speedItems = [];
        shieldItems = [];
        frame = 0;
        setScore(0);
        setCollectedCoins(0); // Reset collected coins
        setSpecialItemActive(false); // Reset special item status
        setSpecialItemCountdown(0); // Reset special item countdown
        setSpeedItemActive(false); // Reset speed item status
        setSpeedItemCountdown(0); // Reset speed item countdown
        setShieldActive(false); // Reset shield status
        console.log("Game reset. Coins Collected:", collectedCoins); // Debugging
        pipeGap = initialPipeGap; // Reset the gap to the initial value
        currentSpeed.current = normalSpeed; // Reset speed to normal
        setGameState('playing');
      };

      const flap = () => {
        if (gameState === 'playing') {
          bird.velocity = bird.lift;
          playJumpSound();
          console.log("Flap. Coins Collected:", collectedCoins); // Debugging
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        console.log(`KeyDown: ${e.code}, GameState: ${gameState}`); // Debugging
        if (e.code === 'Space') {
          if (gameState === 'playing') {
            flap();
          }
        } else if (e.code === 'KeyR') {
          if (gameState === 'restart') {
            console.log('Restarting the game...');
            resetGame();
          }
        }
      };

      const handleClick = () => {
        console.log(`Click, GameState: ${gameState}`); // Debugging
        if (gameState === 'start') {
          console.log('Starting the game...');
          setGameState('playing');
          resetGame();
        } else if (gameState === 'restart') {
          console.log('Restarting the game...');
          resetGame();
        } else if (gameState === 'playing') {
          flap();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      canvas.addEventListener('click', handleClick);

      gameLoop(); // Ensure the game loop starts initially to show the start screen

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        canvas.removeEventListener('click', handleClick);
      };
    };

    const playJumpSound = () => {
      const jumpSound = jumpSoundRef.current;
      if (jumpSound) {
        jumpSound.currentTime = 0; // Reset to start
        jumpSound.play();
      }
    };

    const playGameOverSound = () => {
      const gameOverSound = gameOverSoundRef.current;
      if (gameOverSound) {
        gameOverSound.currentTime = 0; // Reset to start
        gameOverSound.play();
      }
    };

    const playCoinSound = () => {
      const coinSound = coinSoundRef.current;
      if (coinSound) {
        coinSound.currentTime = 0; // Reset to start
        coinSound.play();
      }
    };

    const playWeedSound = () => {
      const weedSound = weedSoundRef.current;
      if (weedSound) {
        weedSound.currentTime = 0; // Reset to start
        weedSound.play();
      }
    };

    const playRedBullSound = () => {
      const redBullSound = redBullSoundRef.current;
      if (redBullSound) {
        redBullSound.currentTime = 0; // Reset to start
        redBullSound.play();
      }
    };

    const playShieldSound = () => {
      const shieldSound = shieldSoundRef.current;
      if (shieldSound) {
        shieldSound.currentTime = 0; // Reset to start
        shieldSound.play();
      }
    };

  }, [gameState]);

  useEffect(() => {
    // Handle special item countdown
    let countdownInterval;
    if (specialItemActive) {
      currentSpeed.current = slowSpeed; // Slow down the speed
      countdownInterval = setInterval(() => {
        setSpecialItemCountdown(prevCountdown => {
          if (prevCountdown <= 1) {
            setSpecialItemActive(false);
            currentSpeed.current = normalSpeed; // Restore normal speed
            clearInterval(countdownInterval);
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdownInterval);
  }, [specialItemActive]);

  useEffect(() => {
    // Handle speed item countdown
    let countdownInterval;
    if (speedItemActive) {
      currentSpeed.current = fastSpeed; // Increase the speed
      countdownInterval = setInterval(() => {
        setSpeedItemCountdown(prevCountdown => {
          if (prevCountdown <= 1) {
            setSpeedItemActive(false);
            currentSpeed.current = normalSpeed; // Restore normal speed
            clearInterval(countdownInterval);
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdownInterval);
  }, [speedItemActive]);

  useEffect(() => {
    if (gameState === 'restart' && score > highScore) {
      console.log("Updating high score in state and localStorage");
      setHighScore(score);
      localStorage.setItem('highScore', score.toString());
      if (walletAddress) {
        console.log("Submitting high score to the server");
        submitHighScore(walletAddress, score);
      }
    }
  }, [gameState, score, highScore, walletAddress]);

  const submitHighScore = async (walletAddress: string, score: number) => {
    console.log('submitHighScore called with:', { walletAddress, score }); // Debugging
    try {
      const response = await fetch('/api/highscores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress, score }),
      });

      const data = await response.json();
      if (data.success) {
        console.log('Highscore successfully recorded');
      } else {
        console.error('Failed to record highscore:', data.message);
      }
    } catch (error) {
      console.error('Error submitting highscore:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative game-container" style={{ background: 'linear-gradient(rgb(161, 227, 255) 0%, rgba(58, 121, 187, 0.98) 100%)' }}>
      <style jsx>{`
        .blur-top {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 20vh;
          backdrop-filter: blur(20px);
          z-index: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          text-align: center;
        }
        .blur-bottom {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 20vh;
          backdrop-filter: blur(20px);
          z-index: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
        }
        .game-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      `}</style>
      <div className="absolute top-0 left-0 w-full h-full bg-cover bg-no-repeat bg-center" style={{ backgroundImage: 'url(/images/Cloud.png)' }}></div>
      <div className="blur-top">
        <h1 className="text-3xl font-bold" style={{ 
            fontFamily: 'CHIBOLD',
            fontWeight: 700,
            fontSize: '3em',
            lineHeight: '1.1em',
            WebkitTextStrokeWidth: '0.1px',
            WebkitTextStrokeColor: '#000',
            stroke: '#000',
            textShadow: '3px 0.1px 0px #000000',
            color: '#FFFFFF'
          }}
        >
          Flappy BabyBobo
        </h1>
        <WalletConnect onConnect={handleConnect} />
      </div>
      <div className="game-content">
        <canvas ref={canvasRef} className="border border-black"></canvas>
      </div>
      <div className="blur-bottom">
        <p className="mt-4 text-blue-500 w-full text-center" style={{ 
          fontFamily: 'CHIBOLD',
          fontWeight: 700,
          fontSize: '1.5em',
          lineHeight: '1.1em',
          WebkitTextStrokeWidth: '0.1px',
          WebkitTextStrokeColor: '#000',
          stroke: '#000',
          textShadow: '3px 0.1px 0px #000000',
          color: '#FFFFFF'
        }}>Score: {score}m</p>
        <p className="mt-2 text-yellow-500 w-full text-center" style={{ 
          fontFamily: 'CHIBOLD',
          fontWeight: 700,
          fontSize: '1.5em',
          lineHeight: '1.1em',
          WebkitTextStrokeWidth: '0.1px',
          WebkitTextStrokeColor: '#000',
          stroke: '#000',
          textShadow: '3px 0.1px 0px #000000',
          color: '#FFFFFF'
        }}>Coins: {collectedCoins}</p>
        {specialItemActive && (
          <p className="mt-2 text-green-500 w-full text-center" style={{ 
            fontFamily: 'CHIBOLD',
            fontWeight: 700,
            fontSize: '1.5em',
            lineHeight: '1.1em',
            WebkitTextStrokeWidth: '0.1px',
            WebkitTextStrokeColor: '#000',
            stroke: '#000',
            textShadow: '3px 0.1px 0px #000000',
            color: '#FFFFFF'
          }}>Slow Time: {specialItemCountdown}s</p>
        )}
        {speedItemActive && (
          <p className="mt-2 text-white w-full text-center" style={{ 
            fontFamily: 'CHIBOLD',
            fontWeight: 700,
            fontSize: '1.5em',
            lineHeight: '1.1em',
            WebkitTextStrokeWidth: '0.1px',
            WebkitTextStrokeColor: '#000',
            stroke: '#000',
            textShadow: '3px 0.1px 0px #000000',
            color: '#FFFFFF'
          }}>Fast Time: {speedItemCountdown}s</p>
        )}
        {shieldActive && (
          <p className="mt-2 text-orange-500 w-full text-center" style={{ 
            fontFamily: 'CHIBOLD',
            fontWeight: 700,
            fontSize: '1.5em',
            lineHeight: '1.1em',
            WebkitTextStrokeWidth: '0.1px',
            WebkitTextStrokeColor: '#000',
            stroke: '#000',
            textShadow: '3px 0.1px 0px #000000',
            color: '#FFFFFF'
          }}>Shield: Active</p>
        )}
      </div>
      <audio ref={jumpSoundRef} src="/sounds/jump.mp3"></audio>
      <audio ref={gameOverSoundRef} src="/sounds/gameover.mp3"></audio>
      <audio ref={coinSoundRef} src="/sounds/coin.mp3"></audio>
      <audio ref={weedSoundRef} src="/sounds/Weed.mp3"></audio>
      <audio ref={redBullSoundRef} src="/sounds/RedBull.mp3"></audio>
      <audio ref={shieldSoundRef} src="/sounds/shield.mp3"></audio>
    </div>
  );
};

export default Game;
