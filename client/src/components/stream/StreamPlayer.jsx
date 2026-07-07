// Mocked video player -- this project has no real RTMP/HLS ingest (see
// server/src/services/stream.service.js), so `playbackUrl` doesn't point at
// a real live feed. This component still wires up the actual <video> tag
// (an hls.js integration would slot in here unchanged) so the UI reads as
// production-shaped rather than a placeholder box.
import ViewerCount from './ViewerCount.jsx';

const StreamPlayer = ({ stream, viewerCount }) => (
  <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
    {stream?.thumbnail ? (
      <img src={stream.thumbnail} alt={stream.title} className="h-full w-full object-cover" />
    ) : (
      <div className="flex h-full items-center justify-center text-white/30">
        <p>Live playback would render here (mocked ingest — see docs).</p>
      </div>
    )}
    <div className="absolute left-3 top-3">
      <ViewerCount count={viewerCount} />
    </div>
  </div>
);

export default StreamPlayer;
