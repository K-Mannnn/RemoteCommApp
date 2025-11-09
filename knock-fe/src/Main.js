import React, { useEffect, useState, useRef } from 'react';
import './Main.css';
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";

const Container = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Row = styled.div`
  ${'' /* display: flex; */}
  width: 100%;
`;

const Video = styled.video`
  ${'' /* border: 1px solid blue; */}
  width: 50%;
  height: 50%;
`;

function Main({user}) {
    const [yourID, setYourID] = useState("");
    const [yourName, setYourName] = useState("");
    const [allusers, setAllusers] = useState([]);
    const [stream, setStream] = useState();
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState();
    const [callAccepted, setCallAccepted] = useState(false);
    const [calling, setCalling] = useState(false)
    const [callEnded, setCallEnded] = useState (false)
  
 
    
  
    const userVideo = useRef();
    const partnerVideo = useRef();
    const socket = useRef();
    
    
    useEffect(() => {
        socket.current = io.connect('http://localhost:8000');
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
          setStream(stream);
          if (userVideo.current) {
            userVideo.current.srcObject = stream;
          }
        })
    
        socket.current.emit('newUser', user);
      
        socket.current.on("onlineUsers", onlineUsers => {
          setAllusers(onlineUsers);
        })
      

        socket.current.on("yourID", (id) => {
          setYourID(id);
          })
 
    
        socket.current.on("hey", (data) => {
          setReceivingCall(true);
          setCaller(data.from);
          setCallerSignal(data.signal);
          setYourName(data.name)
        })

        socket.current.on('callEnded', () => {
          setCallAccepted(false);
        })

      },[]);

    function callPeer(id) {
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream,
      });
  
      peer.on("signal", data => {
        socket.current.emit("callUser", { userToCall: id, signalData: data, from: yourID, name: user })
      })
  
      peer.on("stream", stream => {
        if (partnerVideo.current) {
          partnerVideo.current.srcObject = stream;
        }
      });
  
      socket.current.on("callAccepted", signal => {
        setCallAccepted(true);
        setCalling(false)
        peer.signal(signal);
      })


      
    }
  
    function acceptCall() {
      setCallAccepted(true);
      setCalling(false);
      setReceivingCall(false)
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: stream,
      });
      peer.on("signal", data => {
        socket.current.emit("acceptCall", { signal: data, to: caller })
      })
  
      peer.on("stream", stream => {
        partnerVideo.current.srcObject = stream;
      });
  
      peer.signal(callerSignal);
      
    }

    function leaveCall() {
      setCallAccepted(false);
      setCallEnded (true);
      
      socket.current.emit("endCall")
    
    }
  

    let UserVideo;
    if (stream && !calling) {
      UserVideo = (
        <Video playsInline muted ref={userVideo} autoPlay />
      );
    }
  
    let PartnerVideo;
    if (callAccepted) {
      PartnerVideo = (
        <Video playsInline ref={partnerVideo} autoPlay />
      );
    }
  
    let incomingCall;
    if (receivingCall && !callAccepted) {
      incomingCall = (
        <div>
          <h1>{yourName}</h1>
          <button className='btn' onClick={acceptCall}>Accept</button>
        </div>
      )
    }


    return (
      <Container className='main-container'>

        {calling? (<div className='calling'></div> ): 
        ( <Row className='video'>
          {/* {UserVideo} */}
          {PartnerVideo}
        </Row>)
        }

        {receivingCall? (
        <Row className='incoming'>
          {incomingCall}
        </Row>) : null
        }

        <Row>
          {callAccepted? (<button className='btn-end' onClick = {leaveCall}> End call </button>): null }
        </Row>
        <Row className='btn-row'>
          {allusers.map(key => {

            if (key.socketId === yourID) {
              return null
            }

            return (
              
              <button key={key.socketId} className='knock-btn' 
              onClick={() => {
                callPeer(key.socketId)
                setCalling(true)
                    }
                }
              >
              {key.username}
              </button>
          
  
            );
          })}
        </Row>


        
        
      </Container>
    );
  }
  
  export default Main;