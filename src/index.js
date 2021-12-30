process.on("unhandledRejection", function (reason, p) {
  console.log("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
  // application specific logging here
});

const { getStreams, createTranscode, getIngestStats, getTranscodes, getStream, deleteTranscode } = require("./streams");
const { createDroplet, deleteDroplet } = require("./digitalocean");

const checkStreams = async () => {
  const streams = await getStreams();

  for (let stream of streams) {
    if (stream.transcode) continue;

    const user = stream.user;
    if (user.angel) {
      transcode(stream);
      continue;
    }

    if (user.patreon && user.patreon.isPatron && user.patreon.tier >= 3) {
      const tier = user.patreon.tier;
      if (tier === 3) {
        if (stream.viewer_count >= 10) {
          transcode(stream);
        }
        continue;
      } else {
        transcode(stream);
        continue;
      }
    }

    if (stream.viewer_count >= 1000) {
      transcode(stream);
      continue;
    }
  }

  setTimeout(checkStreams, 60000);
};

const checkTranscodes = async () => {
  const transcodes = await getTranscodes();

  for (let transcode of transcodes.data) {
    const stream = await getStream(transcode.streamId);
    if (stream.length !== 0) continue;
    let success = deleteDroplet(transcode.droplet_id);
    if (!success) console.error(`Failed to delete droplet ${transcode.droplet_id}`);
    success = deleteTranscode(transcode.streamId);
    if (!success) console.error(`Failed to delete transcode ${transcode.streamId}`);
  }

  setTimeout(checkTranscodes, 30000);
};

const transcode = async (stream) => {
  console.info(`Start Transcode: ${stream.user.display_name}`);

  const outputs = await getOutputs(stream);
  if (!outputs) return console.error("Failed to get outputs..");

  const dropletId = await createDroplet(stream);
  if (!dropletId) return console.error("Failed to get droplet id..");

  await createTranscode(stream, outputs, dropletId);
};

/* 
    Outputs:
        Name     
        Variant 
        Bandwidth 
        Width
        Height
        FrameRate
*/
const getOutputs = async (stream) => {
  const stats = await getIngestStats(stream.ingest.server, stream.user.username);
  if (!stats) return null;
  const video = stats.Meta.Video;

  const outputs = [];

  //Source
  outputs.push({
    name: `${video.height}p${video.FrameRate}`,
    variant: "src",
    bandwidth: stats.BwVideo + stats.BwAudio,
    width: video.Width,
    height: video.Height,
    framerate: video.FrameRate,
  });

  if (video.Width > 1280) {
    outputs.push({
      name: "720p30",
      variant: "medium",
      bandwidth: 3476000,
      video_bandwidth: "2500k",
      audio_bandwidth: "160k",
      width: 1280,
      height: 720,
      framerate: 30,
    });
  }

  if (video.Width === 1280 && video.FrameRate >= 29) {
    outputs.push({
      name: "720p30",
      variant: "medium",
      bandwidth: 3476000,
      video_bandwidth: "2500k",
      audio_bandwidth: "160k",
      width: 1280,
      height: 720,
      framerate: 30,
    });
  }

  if (video.Width >= 1280) {
    outputs.push({
      name: "480p30",
      variant: "low",
      bandwidth: 2292400,
      video_bandwidth: "1500k",
      audio_bandwidth: "160k",
      width: 854,
      height: 480,
      framerate: video.FrameRate >= 29 ? 30 : Math.ceil(video.FrameRate),
    });
  }

  return outputs;
};

const main = () => {
  console.info("Transcode-Main Running..");
  checkStreams();
  checkTranscodes();
};

main();
