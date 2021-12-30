const axios = require("axios");
const config = require("../config/config.json");

module.exports.getStreams = async () => {
  const streams = await axios({
    url: `${config.streams.hostname}/streams`,
    method: "GET",
    headers: {
      "X-Api-Key": `${config.streams.authKey}`,
    },
  })
    .then((res) => res.data)
    .catch((e) => {
      console.error(e);
      return null;
    });
  return streams;
};

module.exports.getIngestStats = async (server, name) => {
  const stats = await axios({
    url: `${config.streams.hostname}/v3/ingest/stats`,
    method: "POST",
    headers: {
      "X-Api-Key": `${config.streams.authKey}`,
    },
    data: {
      server: server,
      name: name,
    },
  })
    .then((res) => res.data)
    .catch((e) => {
      console.error(e);
      return null;
    });
  return stats;
};

module.exports.createTranscode = async (stream, outputs, dropletId) => {
  const success = await axios({
    url: `${config.streams.hostname}/transcodes`,
    method: "POST",
    headers: {
      "X-Api-Key": `${config.streams.authKey}`,
    },
    data: {
      streamId: stream.id,
      outputs: outputs,
      transcoding: false,
      droplet_id: dropletId,
    },
  })
    .then(() => true)
    .catch((e) => {
      console.error(e);
      return false;
    });
  return success;
};

module.exports.getTranscodes = async () => {
  const transcodes = await axios({
    url: `${config.streams.hostname}/transcodes`,
    method: "GET",
    headers: {
      "X-Api-Key": `${config.streams.authKey}`,
    },
  })
    .then((res) => res.data)
    .catch((e) => {
      console.error(e);
      return null;
    });
  return transcodes;
};

module.exports.getStream = async (streamId) => {
  const stream = await axios({
    url: `${config.streams.hostname}/streams?id=${streamId}`,
    method: "GET",
    headers: {
      "X-Api-Key": `${config.streams.authKey}`,
    },
  })
    .then((res) => res.data)
    .catch((e) => {
      console.error(e);
      return null;
    });
  return stream;
};

module.exports.deleteTranscode = async (streamId) => {
  const success = await axios({
    url: `${config.streams.hostname}/transcodes/${streamId}`,
    method: "DELETE",
    headers: {
      "X-Api-Key": `${config.streams.authKey}`,
    },
  })
    .then(() => true)
    .catch((e) => {
      console.error(e);
      return false;
    });
  return success;
};
