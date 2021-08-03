import { useEffect, useState, memo } from "react";
import { Input, Container, Button, Text, Box, Stack } from "@chakra-ui/react";
import { FaTwitter, FaGithub } from "react-icons/fa";
import { alphabetRu } from "./alphabets";

const States = {
  MainMenu: "main-menu",
  Game: "game",
  ScoreBoard: "score-board",
};

const initialState = {
  screen: States.MainMenu,
};

let gameId = 0;
const getGameId = () => gameId++;

function App() {
  const [gameState, setGameState] = useState(initialState);

  switch (gameState.screen) {
    case States.MainMenu:
      return (
        <MainMenuScreen
          onStart={() =>
            setGameState({
              screen: States.Game,
              gameId: getGameId(),
            })
          }
        />
      );
    case States.Game:
      return (
        <GameScreen
          key={gameId}
          onRestart={() =>
            setGameState({
              screen: States.Game,
              gameId: getGameId(),
            })
          }
          onFinish={(score) =>
            setGameState({ screen: States.ScoreBoard, score })
          }
        />
      );
    case States.ScoreBoard:
      return (
        <ScoreScreen
          score={gameState.score}
          onRestart={() =>
            setGameState({
              screen: States.Game,
              gameId: getGameId(),
            })
          }
        />
      );
    default:
      throw new Error("Unknown game state:", gameState);
  }
}

function MainMenuScreen({ onStart }) {
  return (
    <ScreenWrapper>
      <Text mb={8} textAlign="center" fontSize="xl">
        Узнай, как быстро ты сможешь набрать весь алфавит на клавиатуре
      </Text>
      <Button autoFocus onClick={onStart}>
        Поехали!
      </Button>
    </ScreenWrapper>
  );
}

const joinedAlphabet = alphabetRu.join("");

function GameScreen({ onRestart, onFinish }) {
  const [score, setScore] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [countDown, setCountDown] = useState(3);

  useEffect(() => {
    if (countDown === 0) {
      setGameStarted(true);
      return;
    }
    const interval = setTimeout(() => {
      setCountDown((countDown) => countDown - 1);
    }, 1000);
    return () => clearTimeout(interval);
  }, [countDown, gameStarted]);

  useEffect(() => {
    if (!gameStarted) {
      return;
    }

    const startTime = Date.now();
    const intervalId = setInterval(() => {
      setScore(Date.now() - startTime);
    }, 1);

    return () => {
      clearInterval(intervalId);
    };
  }, [gameStarted]);

  useEffect(() => {
    if (inputValue.toLowerCase() === joinedAlphabet) {
      onFinish(score);
    }
  }, [inputValue, onFinish, score]);

  if (!gameStarted) {
    return (
      <ScreenWrapper>
        <Text fontSize="9xl">{countDown}</Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Box mb={4} alignSelf="flex-end">
        <Result score={score} />
      </Box>
      <Box mb={4}>
        <Alphabet alphabet={alphabetRu} inputValue={inputValue} />
      </Box>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        mb={8}
        autoFocus
        onPaste={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
      />
      <Button onClick={onRestart}>Попробовать снова</Button>
    </ScreenWrapper>
  );
}

function ScoreScreen({ score, onRestart }) {
  return (
    <ScreenWrapper>
      <Text mb={8} textAlign="center" fontSize="xl" alignSelf>
        <Result score={score} />
      </Text>
      <Stack>
        <Button onClick={onRestart}>Попробовать снова</Button>
        <Button
          as="a"
          href={
            "https://twitter.com/intent/tweet?text=" +
            "Я набрал русский алфавит на клавиатуре за " +
            (score / 1000).toFixed(2) +
            " сек. " +
            "Проверь себя тут: https://nanot1m.github.io/alphabet-typer/"
          }
          aria-label="tweet"
          rightIcon={<FaTwitter />}
          colorScheme="blue"
          target="_blank"
        >
          Поделиться
        </Button>
      </Stack>
    </ScreenWrapper>
  );
}

function ScreenWrapper({ children }) {
  return (
    <Box display="flex" flexDirection="column" h="full" pb={10}>
      <Container
        h="full"
        pb={16}
        pt={8}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        {children}
      </Container>
      <Button
        as="a"
        rightIcon={<FaGithub />}
        variant="link"
        target="_blank"
        href="https://github.com/nanot1m/alphabet-typer"
        mt={4}
      >
        @nanot1m
      </Button>
    </Box>
  );
}

const Alphabet = memo(({ alphabet, inputValue }) => {
  return (
    <Box display="flex" flexWrap="wrap" justifyContent="center">
      {alphabet.map((letter, i) => (
        <Text
          key={letter}
          fontSize={["s", "xl", "x-large"]}
          color={
            inputValue[i] === undefined
              ? "gray.400"
              : inputValue[i]?.toLowerCase() === letter
              ? "gray.800"
              : "red"
          }
        >
          {letter.toUpperCase()}
        </Text>
      ))}
    </Box>
  );
});

function Result({ score }) {
  return (
    <Box>
      <Text textAlign="left" fontSize="xl">
        Твой результат
      </Text>
      <Text fontSize="xx-large">{(score / 1000).toFixed(2)}</Text>
      <Text fontSize="xl">сек.</Text>
    </Box>
  );
}

export default App;
