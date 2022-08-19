import { useRef, useEffect, useState } from 'react';
import './App.css';
import * as faceapi from "face-api.js";
import { FaceExpressions } from 'face-api.js';
import * as React from 'react';

function App() {

  let number = 0;
  
  const msRest = require("@azure/ms-rest-js");
  const Face = require("@azure/cognitiveservices-face");
  const { v4: uuid } = require('uuid');
  
  const credentials = new msRest.ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } });
  const client = new Face.FaceClient(credentials, endpoint);

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
      
      async function DetectFaceRecognize(url) {
        // Detect faces from image URL. Since only recognizing, use the recognition model 4.
        // We use detection model 3 because we are only retrieving the qualityForRecognition attribute.
        // Result faces with quality for recognition lower than "medium" are filtered out.
        let detected_faces = await client.face.detectWithUrl(url,
            {
                detectionModel: "detection_03",
                recognitionModel: "recognition_04",
                returnFaceAttributes: ["QualityForRecognition"]
            });
        return detected_faces.filter(face => face.faceAttributes.qualityForRecognition == 'high' || face.faceAttributes.qualityForRecognition == 'medium');
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

      if (final_emotion == 'neutral')
      {
        final_emotion = 'moody';
      }

      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': 'fb5b0920f6msh804c07d430a8210p1d0067jsn6dc2b529beba',
          'X-RapidAPI-Host': 'spotify23.p.rapidapi.com'
        }
      };
      
      fetch('https://spotify23.p.rapidapi.com/search/?q=' + final_emotion + '&type=playlist&limit=50', options)
        .then(response => response.json())
        .then( (val) => {
          var playlist_number = Math.floor(Math.random() * 5);
          const selected_playlist = val.playlists.items[playlist_number].data['uri'];
          const selected_playlist_id = selected_playlist.slice(17);
          const playlist_opened = 'https://open.spotify.com/playlist/' + selected_playlist_id; 
          window.open(playlist_opened,'_blank');
        } )
        .catch(err => console.error(err));
  
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

    }, 2000)
  }

  return (
    <div  className="app">
      <h1> AI FACE DETECTION</h1>
      <h1>  </h1>
      <div className='app__video'>
        <video crossOrigin='anonymous' ref={videoRef} autoPlay ></video>
      </div>
        <canvas ref={canvasRef} width="940" height="650" className='app__canvas' />
        <button onClick={() => {console.log("Button clicked")}} > Take picture! </button>
    </div>
  );
}

export default App;
