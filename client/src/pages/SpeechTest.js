import React, { useState, useEffect, useRef } from 'react';
import './SpeechTest.css';
import Navbar from '../components/Navbar';

const sentences = [
  "Zebra zoomed zig-zagging zealously.",
  "He yawned yellow yesterday.",
  "Wolves wandered westward, waiting.",
  "Fuzzy Wuzzy was a bear, Fuzzy Wuzzy had no hair.",
  "Uptown umbrellas underlined urban unity.",
  "Baa, baa, black sheep, have you any wool?",
  "Snakes slithered silently, sliding south.",
  "Ravens roamed randomly, resting.",
  "Quick quails quietly questioned.",
  "Peter Piper picked a peck of pickled peppers.",
  "How much wood would a woodchuck chuck, if a woodchuck could chuck wood?",
  "She sells seashells by the seashore."
];

// Simple Levenshtein distance function
function levenshtein(a, b) {
  const matrix = [];
  const aLen = a.length;
  const bLen = b.length;
  if (aLen === 0) return bLen;
  if (bLen === 0) return aLen;

  // initialize matrix
  for (let i = 0; i <= bLen; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= aLen; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= bLen; i++) {
    for (let j = 1; j <= aLen; j++) {
      if (b.charAt(i - 1).toLowerCase() === a.charAt(j - 1).toLowerCase()) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,    // deletion
          matrix[i][j - 1] + 1,    // insertion
          matrix[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }
  return matrix[bLen][aLen];
}

function similarityPercentage(str1, str2) {
  const distance = levenshtein(str1, str2);
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 100;
  return ((maxLen - distance) / maxLen) * 100;
}

export default function SpeechTest() {
  const [testSentence, setTestSentence] = useState('');
  const [resultText, setResultText] = useState('');
  const [similarity, setSimilarity] = useState(null);
  const [message, setMessage] = useState('');
  const [testActive, setTestActive] = useState(false);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // Pick a new prompt when component mounts or test ends.
  const pickNewSentence = () => {
    const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
    setTestSentence(randomSentence);
  };

  // When the component mounts, pick an initial sentence.
  useEffect(() => {
    pickNewSentence();
  }, []);

  // Start speech recognition.
  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessage("Sorry, your browser does not support speech recognition.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setResultText(transcript);
      const sim = similarityPercentage(testSentence, transcript);
      setSimilarity(sim.toFixed(2));
      if (sim < 75) {
        setMessage("You might be drunk. Try again.");
      } else {
        setMessage("Well done! You said it clearly.");
      }
    };
    recognition.onerror = (event) => {
      setMessage("Error during recognition: " + event.error);
    };
    recognition.onend = () => {
      setTestActive(false);
      clearTimeout(timerRef.current);
      // When recognition ends, pick a new sentence for next test.
      pickNewSentence();
    };

    recognition.start();
    recognitionRef.current = recognition;
    setTestActive(true);

    // Automatically stop after 10 seconds if not manually stopped.
    timerRef.current = setTimeout(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }, 10000);
  };

  // Toggle test on button click.
  const handleTestToggle = () => {
    if (testActive) {
      // If active, stop the recognition.
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setTestActive(false);
      clearTimeout(timerRef.current);
    } else {
      // Start a new test.
      setResultText('');
      setSimilarity(null);
      setMessage('');
      startRecognition();
    }
  };

  return (
    <div className="speech-test-container">
      <Navbar onSignOut={() => {
        localStorage.removeItem('bacshotsUser');
        window.location.href = '/signin';
      }} />
      <div className="speech-test-content">
        <h1>Speech Test</h1>
        <p className="instruction">You have 10 seconds to say the sentence below:</p>
        <div className="test-sentence">{testSentence}</div>
        <button className="start-btn" onClick={handleTestToggle}>
          {testActive ? "Stop Test" : "Start Test"}
        </button>
        {resultText && (
          <div className="result">
            <p>Your Speech: <em>{resultText}</em></p>
            <p>Match Percentage: {similarity}%</p>
            <p>{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
