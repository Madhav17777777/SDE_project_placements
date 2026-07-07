// Convenience wrappers around SocketContext:
//  - useStreamChat: chat-room lifecycle (join on mount, leave on unmount).
//  - useStreamBroadcast / useStreamViewer: a lightweight WebRTC peer-to-peer
//    video path so "Go Live" can show a real camera feed to viewers without
//    building actual RTMP/HLS ingest (see server/src/sockets/webrtc.socket.js
//    and the README's Known Limitations for why that's out of scope for this
//    project). Signaling (SDP offers/answers, ICE candidates) rides the same
//    Socket.io connection already used for chat; the actual video/audio never
//    touches the server, it flows directly between the two browsers.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocketContext } from '../context/SocketContext.jsx';
import { useStreamStore } from '../store/streamStore.js';

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

export const useStreamChat = (streamId) => {
  const { socket } = useSocketContext();
  const setViewerCount = useStreamStore((s) => s.setViewerCount);
  const setMessages = useStreamStore((s) => s.setMessages);
  const addMessage = useStreamStore((s) => s.addMessage);
  const setTypingUser = useStreamStore((s) => s.setTypingUser);
  const clearTypingUser = useStreamStore((s) => s.clearTypingUser);
  const setActiveStream = useStreamStore((s) => s.setActiveStream);

  useEffect(() => {
    if (!socket || !streamId) return undefined;

    setActiveStream(streamId);
    socket.emit('chat:join', { streamId });

    const onHistory = ({ messages }) => setMessages(messages);
    const onMessage = ({ message }) => addMessage(message);
    const onViewerCount = ({ count }) => setViewerCount(count);
    const onTyping = ({ userId, username }) => {
      setTypingUser(userId, username);
      setTimeout(() => clearTypingUser(userId), 3000);
    };

    socket.on('chat:history', onHistory);
    socket.on('chat:message', onMessage);
    socket.on('stream:viewerCount', onViewerCount);
    socket.on('chat:typing', onTyping);

    return () => {
      socket.emit('chat:leave', { streamId });
      socket.off('chat:history', onHistory);
      socket.off('chat:message', onMessage);
      socket.off('stream:viewerCount', onViewerCount);
      socket.off('chat:typing', onTyping);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, streamId]);

  const sendMessage = (content) => socket?.emit('chat:message', { streamId, content });
  const sendTyping = () => socket?.emit('chat:typing', { streamId });

  return { sendMessage, sendTyping };
};

// Streamer side: grabs the local camera/mic on demand (`startBroadcast`,
// called from a button click since getUserMedia requires a user gesture),
// then opens one RTCPeerConnection per viewer that shows up.
export const useStreamBroadcast = (streamId, localVideoRef) => {
  const { socket } = useSocketContext();
  const peersRef = useRef(new Map()); // viewerId -> RTCPeerConnection
  const localStreamRef = useRef(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [error, setError] = useState(null);

  const closeAllPeers = useCallback(() => {
    peersRef.current.forEach((pc) => pc.close());
    peersRef.current.clear();
  }, []);

  const stopBroadcast = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    closeAllPeers();
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (streamId) socket?.emit('webrtc:broadcaster-stop', { streamId });
    setIsBroadcasting(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, streamId, closeAllPeers]);

  const startBroadcast = useCallback(async () => {
    if (!streamId) return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      socket?.emit('webrtc:broadcaster-ready', { streamId });
      setIsBroadcasting(true);
    } catch (err) {
      setError(err.message || 'Could not access camera/microphone');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, streamId]);

  useEffect(() => {
    if (!socket || !streamId) return undefined;

    const onViewerJoined = async ({ viewerId }) => {
      if (!localStreamRef.current) return;
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current));
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc:ice-candidate', { streamId, targetId: viewerId, candidate: event.candidate });
        }
      };
      peersRef.current.set(viewerId, pc);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('webrtc:offer', { streamId, targetId: viewerId, sdp: offer });
    };

    const onAnswer = async ({ from, sdp }) => {
      const pc = peersRef.current.get(from);
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    };

    const onIceCandidate = async ({ from, candidate }) => {
      const pc = peersRef.current.get(from);
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch {
          /* benign -- can happen with late/out-of-order candidates */
        }
      }
    };

    const onViewerLeft = ({ viewerId }) => {
      peersRef.current.get(viewerId)?.close();
      peersRef.current.delete(viewerId);
    };

    socket.on('webrtc:viewer-joined', onViewerJoined);
    socket.on('webrtc:answer', onAnswer);
    socket.on('webrtc:ice-candidate', onIceCandidate);
    socket.on('webrtc:viewer-left', onViewerLeft);

    return () => {
      socket.off('webrtc:viewer-joined', onViewerJoined);
      socket.off('webrtc:answer', onAnswer);
      socket.off('webrtc:ice-candidate', onIceCandidate);
      socket.off('webrtc:viewer-left', onViewerLeft);
    };
  }, [socket, streamId]);

  // Stop the camera + close peers if the component unmounts mid-broadcast
  // (e.g. the streamer navigates away without clicking "Stop Camera").
  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      closeAllPeers();
    };
  }, [closeAllPeers]);

  return { startBroadcast, stopBroadcast, isBroadcasting, error };
};

// Viewer side: announces itself and waits for the broadcaster's offer.
export const useStreamViewer = (streamId, remoteVideoRef) => {
  const { socket } = useSocketContext();
  const pcRef = useRef(null);
  const [hasBroadcaster, setHasBroadcaster] = useState(false);

  useEffect(() => {
    if (!socket || !streamId) return undefined;

    const cleanupPeer = () => {
      pcRef.current?.close();
      pcRef.current = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      setHasBroadcaster(false);
    };

    const onOffer = async ({ from, sdp }) => {
      cleanupPeer();
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pc.ontrack = (event) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      };
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc:ice-candidate', { streamId, targetId: from, candidate: event.candidate });
        }
      };
      pcRef.current = pc;

      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('webrtc:answer', { streamId, targetId: from, sdp: answer });
      setHasBroadcaster(true);
    };

    const onIceCandidate = async ({ candidate }) => {
      if (pcRef.current && candidate) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch {
          /* benign -- can happen with late/out-of-order candidates */
        }
      }
    };

    socket.on('webrtc:offer', onOffer);
    socket.on('webrtc:ice-candidate', onIceCandidate);
    socket.on('webrtc:broadcaster-offline', cleanupPeer);
    socket.on('webrtc:no-broadcaster', cleanupPeer);

    socket.emit('webrtc:viewer-ready', { streamId });

    return () => {
      socket.emit('webrtc:viewer-left', { streamId });
      socket.off('webrtc:offer', onOffer);
      socket.off('webrtc:ice-candidate', onIceCandidate);
      socket.off('webrtc:broadcaster-offline', cleanupPeer);
      socket.off('webrtc:no-broadcaster', cleanupPeer);
      cleanupPeer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, streamId]);

  return { hasBroadcaster };
};
