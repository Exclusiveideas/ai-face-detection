import { useRef, useEffect } from 'react';
import './App.css';
import * as faceapi from "face-api.js";

function App() {
  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    startVideo();

    videoRef && loadModels();

  }, [])
  
    const loadModels = () => {
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
      ]).then(() => {
        handleVideo();
      })
    }

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((currentStream) => {
        videoRef.current.srcObject = currentStream;
      })
      .catch((err) => {
        console.error(err)
      });
  }

  const handleVideo = async () => {
    setInterval(async() => {
      const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
      
      canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(videoRef.current);
      faceapi.matchDimensions(canvasRef.current, {
        width: 940,
        height: 650,
      })

      const resized = faceapi.resizeResults(detections, {
        width: 940,
        height: 650,
      });

      // canvasRef.getContext("2d").clearRect(0, 0, canvasRef.width, canvasRef.height)
      faceapi.draw.drawDetections(canvasRef.current, resized)
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resized)
      faceapi.draw.drawFaceExpressions(canvasRef.current, resized)

    }, 1000)
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between'}} className="App">
      <h1>FACE API DETECTION</h1>
      <div style={{display: 'flex',  alignItems: 'center', flexDirection: 'column'}}>
        <video crossOrigin='anonymous' ref={videoRef} id="video" autoPlay ></video>
      </div>
        <canvas ref={canvasRef} width="940" height="650" style={{ position: 'absolute', top: '100px'}} />
      
    </div>
  );
}

export default App;
