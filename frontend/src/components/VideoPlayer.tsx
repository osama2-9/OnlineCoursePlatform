import ReactPlayer from "react-player";
interface VideoPlayer {
  videoUrl: string;
}
export const VideoPlayer = ({ videoUrl }: VideoPlayer) => {
  return (
    <div
      className="mt-4 bg-black rounded-md overflow-hidden"
      style={{
        position: "relative",
        paddingTop: "56.25%",
      }}
    >
      <ReactPlayer
      
        url={videoUrl}
        controls
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
        playing={false}
        light={true}
        volume={0.8}
        muted={false}
        config={{
          youtube: {
            playerVars: { showinfo: 0, modestbranding: 1 },
          },
        }}
      />
    </div>
  );
};
