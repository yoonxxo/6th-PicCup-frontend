import { useRef, useState } from 'react';

function App() {
  const videoRef = useRef(null);
  const [error, setError] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(false);

  const startCamera = async () => {
      try {
        setError('');

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        console.log('stream:', stream);
        console.log('tracks:', stream.getVideoTracks());
        console.log('settings:', stream.getVideoTracks()[0].getSettings());

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setIsCameraOn(true);
      } catch (err) {
        console.error('카메라 에러:', err);
        setError(`${err.name}: ${err.message}`);
      }
    };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    setIsCameraOn(false);
  };

  return (
    <div>
      <h1>PicCup 카메라 테스트</h1>

      <button onClick={startCamera}>카메라 시작</button>
      <button onClick={stopCamera}>카메라 끄기</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '400px',
            height: '300px',
            backgroundColor: 'black',
            marginTop: '20px',
          }}
        />
      </div>

      <p>{isCameraOn ? '카메라 켜짐' : '카메라 꺼짐'}</p>
    </div>
  );
}

export default App;