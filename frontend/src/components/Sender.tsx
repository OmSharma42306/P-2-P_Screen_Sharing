import { useEffect, useState } from "react"

export function Sender (){
    const [socket,setSocket] = useState<WebSocket | null>(null);

    useEffect(()=>{
        const socket = new WebSocket("ws://localhost:8080");

        socket.onopen = () =>{
            socket?.send(JSON.stringify({type:'sender'}));
        }
        setSocket(socket);
    },[]);

    async function startSendingVideo(){
        if(!socket) return ;
        const pc = new RTCPeerConnection();
        // like whenever sender change some extra things , if he chooses the audio or video
        // doing different things , then you seen like sdp has diffrent things in the object like
        // video,audio ,like parameters, so per change of video or audio , you need to create an offer 
        // with correct things, or parameters/ so you create a trigger when these type of happens.
        // so we created a onnegotiationneeded funcion below. this function do exact things.
        // and this below runs when you share a media .
        pc.onnegotiationneeded = async() => {
            console.log("onnegotiationneeded.")
        const offer = await pc.createOffer(); //sdp
        console.log("OM SHARMA",offer);
        await pc.setLocalDescription(offer);
        socket?.send(JSON.stringify({type:'createOffer',sdp: pc.localDescription}));
        }
        
        
        // this trigger only works on when you send some data or media
        pc.onicecandidate = (event) =>{
            console.log("I am in iceCandidate function",event);
            if(event.candidate){
                // socket?.send(JSON.stringify({type:'iceCandidate',candidate:event.candidate}));
                socket?.send(JSON.stringify({type:'iceCandidate',candidate:event.candidate}));
            }
        }

        
      
        

        // caching the sdp from receiver!

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if(data.type === 'createAnswer'){
                pc.setRemoteDescription(data.sdp);
            }else if(data.type === 'iceCandidate'){
                // it's iceCandidate from Receiver Side.
                pc.addIceCandidate(data.candidate);
            }
        }
        // video adding
        const stream = await navigator.mediaDevices.getDisplayMedia({video:true,audio:false});
        pc.addTrack(stream.getVideoTracks()[0]);
    
    }   
    
    return <div>
        hi i am from sender.

        <button onClick={startSendingVideo}>Send Button</button>
    </div>
}