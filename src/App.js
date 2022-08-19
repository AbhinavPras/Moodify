import { useRef, useEffect, useState } from 'react';
import './App.css';
import * as faceapi from "face-api.js";
import { FaceExpressions } from 'face-api.js';
// import express from 'express';

function App() {

  let number = 0;
  let client_id = '42637a421e564dffacf392cd0fef3df6';
  let client_Secret = '9fba64c6a89d45539af2fe64ac3fc37c';
  const [accessToken, setaccessToken] = useState("")

  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    startVideo();

    videoRef && loadModels();

  }, []);
  
    const loadModels = () => {
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
      ]).then(() => {
        faceDetection();
      })
    };

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((currentStream) => {
        videoRef.current.srcObject = currentStream;
      })
      .catch((err) => {
        console.error(err)
      });
  }

  const faceDetection = async () => {
    setInterval(async() => {
      if (number==1)
      {
        return
      }
      
      const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
      let emotions_displayed = detections[0].expressions;
      if (emotions_displayed != undefined)
      {
        number++;
        
      }
      let max_emotion = 0
      let final_emotion = ""
      for (const [key,value] of Object.entries(emotions_displayed))
      {
        if (value > max_emotion)
        {
          max_emotion = value
          final_emotion = key
        }
      }
  
      canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(videoRef.current);
      faceapi.matchDimensions(canvasRef.current, {
        width: 940,
        height: 650,
      })

      const resized = faceapi.resizeResults(detections, {
        width: 940,
        height: 650,
      });

      faceapi.draw.drawDetections(canvasRef.current, resized)
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resized)
      faceapi.draw.drawFaceExpressions(canvasRef.current, resized)

    }, 1000)
  }

  return (
    <div  className="app">
      <h1> AI FACE DETECTION</h1>
      <h1>  </h1>
      <div className='app__video'>
        <video crossOrigin='anonymous' ref={videoRef} autoPlay ></video>
      </div>
        <canvas ref={canvasRef} width="940" height="650" className='app__canvas' />
      
    </div>
  );
}

export default App;
