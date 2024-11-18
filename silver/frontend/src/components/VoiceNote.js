import React, { useState, useEffect } from 'react';

const VoiceNote = ({ onAudioRecorded, resetAudioPreview }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioURL, setAudioURL] = useState(null);

    useEffect(() => {
        const initializeMediaRecorder = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream);
                setMediaRecorder(recorder);
            } catch (err) {
                console.error('Error accessing microphone:', err);
            }
        };

        initializeMediaRecorder();

        // Reset the audioURL when the resetAudioPreview function is called
        if (resetAudioPreview) {
            setAudioURL(null);
        }

    }, [resetAudioPreview]);

    const startRecording = () => {
        if (mediaRecorder) {
            setIsRecording(true);
            mediaRecorder.start();

            mediaRecorder.ondataavailable = (event) => {
                const blob = new Blob([event.data], { type: 'audio/webm' });
                setAudioURL(URL.createObjectURL(blob));
                onAudioRecorded(blob); // Pass blob to parent component
            };
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            setIsRecording(false);
            mediaRecorder.stop();

            // Clear the mediaRecorder to prevent multiple triggers
            mediaRecorder.onstop = () => {
                setMediaRecorder(null);
            };
        }
    };

    return (
        <div>
            <h3>Record a Voice Note</h3>
            <button onClick={isRecording ? stopRecording : startRecording}>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>

            {audioURL && (
                <div>
                    <h4>Preview:</h4>
                    <audio controls src={audioURL} />
                </div>
            )}
        </div>
    );
};

export default VoiceNote;