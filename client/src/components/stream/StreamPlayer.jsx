// Real video, not a mock -- when the streamer is live and clicks
// "Start Camera," this renders their actual camera feed over WebRTC
// (see hooks/useSocket.js: useStreamBroadcast/useStreamViewer). There's
// still no RTMP/HLS ingest behind this (that stays a documented known
// limitation), but a peer-to-peer camera feed is enough to demo real live
// video between a streamer and a viewer without standing up a media server.
//
// Both <video> elements are mounted unconditionally as soon as they're
// *relevant* (isLive, and owner vs. viewer), rather than only once a stream
// is actually attached -- getUserMedia/ontrack resolve asynchronously, and
// if the <video> only mounted after that resolution, the ref would still be
// null at the moment we try to assign `.srcObject`, silently dropping the
// video. Keeping the element always mounted (just hidden via CSS until
// ready) means the ref is always available when the async stream arrives.
import { useRef } from 'react';
import ViewerCount from './ViewerCount.jsx';
import { useStreamBroadcast, useStreamViewer } from '../../hooks/useSocket.js';

const StreamPlayer = ({ stream, viewerCount, isOwner }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const isLive = stream?.status === 'live';

  const {
    startBroadcast,
    stopBroadcast,
    isBroadcasting,
    error: broadcastError,
  } = useStreamBroadcast(isOwner && isLive ? stream?._id : null, localVideoRef);

  const { hasBroadcaster } = useStreamViewer(!isOwner && isLive ? stream?._id : null, remoteVideoRef);

  const localVideoRelevant = isOwner && isLive;
  const remoteVideoRelevant = !isOwner && isLive;
  const videoVisible = (localVideoRelevant && isBroadcasting) || (remoteVideoRelevant && hasBroadcaster);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
      {localVideoRelevant && (
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className={`h-full w-full object-cover ${isBroadcasting ? '' : 'hidden'}`}
        />
      )}

      {remoteVideoRelevant && (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`h-full w-full object-cover ${hasBroadcaster ? '' : 'hidden'}`}
        />
      )}

      {!videoVisible &&
        (stream?.thumbnail ? (
          <img
            src={stream.thumbnail}
            alt={stream.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/30">
            <p>Live playback would render here (mocked ingest — see docs).</p>
          </div>
        ))}

      <div className="absolute left-3 top-3">
        <ViewerCount count={viewerCount} />
      </div>

      {isOwner && isLive && (
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {broadcastError && (
            <span className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs text-red-300">{broadcastError}</span>
          )}
          {isBroadcasting ? (
            <button onClick={stopBroadcast} type="button" className="btn-secondary rounded-lg px-3 py-1.5 text-xs">
              Stop Camera
            </button>
          ) : (
            <button onClick={startBroadcast} type="button" className="btn-primary rounded-lg px-3 py-1.5 text-xs">
              Start Camera
            </button>
          )}
        </div>
      )}

      {!isOwner && isLive && !hasBroadcaster && (
        <div className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-3 py-1.5 text-xs text-white/60">
          Waiting for the streamer to start their camera…
        </div>
      )}
    </div>
  );
};

export default StreamPlayer;
