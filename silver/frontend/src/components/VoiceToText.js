import React, { useState } from 'react';

const VoiceToText = () => {
    const [isListening, setIsListening] = useState(false);   // Track if the microphone is listening
    const [transcript, setTranscript] = useState('');         // Store the recognized speech

    // Web Speech API setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;      // Keep recognizing until stopped
    recognition.interimResults = true;  // Allow partial results
    recognition.lang = 'en-US';         // Language setting

    // Handle speech recognition start
    const startListening = () => {
        setIsListening(true);
        recognition.start();
    };

    // Handle speech recognition stop
    const stopListening = () => {
        setIsListening(false);
        recognition.stop();
    };

    // Handle recognized speech (onresult event)
    recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
    };

    // Error handling (optional)
    recognition.onerror = (event) => {
        console.error("Speech recognition error detected: ", event.error);
    };

    return (
        <div>
            <h2>Voice to Text</h2>
            <button 
                onClick={isListening ? stopListening : startListening} 
                style={{ backgroundColor: isListening ? 'red' : 'green', color: 'white' }}
            >
                {isListening ? 'Stop' : 'Start'} Listening
            </button>

            <div style={{ marginTop: '20px', padding: '10px', border: '1px solid gray', minHeight: '100px' }}>
                {transcript ? (
                    <p>{transcript}</p>
                ) : (
                    <p>Start speaking and your words will appear here...</p>
                )}
            </div>
        </div>
    );
};

export default VoiceToText;
