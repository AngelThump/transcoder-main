const config = require("../config/config.json");
const axios = require("axios");

module.exports.createDroplet = async (stream) => {
  const userData =
    "#!/bin/bash\n" +
    `wget --username ${config.files.username} --password ${config.files.password} https://${config.files.hostname}.angelthump.com:${config.files.port}/transcoder-image.sh -O /root/startup.sh\n` +
    "chmod +x /root/startup.sh && /root/startup.sh && rm -r /root/startup.sh";

  const transcoderConfig = {
    name: `transcoder-${stream.user.display_name}`,
    region: config.digitalocean.slugs.nyc,
    size: "s-3vcpu-1gb",
    monitoring: false,
    image: config.digitalocean.image,
    ssh_keys: config.digitalocean.ssh_keys,
    backups: false,
    ipv6: false,
    tags: ["transcoder"],
    user_data: userData,
    with_droplet_agent: false,
  };

  const dropletId = await axios({
    url: `https://api.digitalocean.com/v2/droplets`,
    method: "POST",
    headers: {
      authorization: `Bearer ${config.digitalocean.api_key}`,
    },
    data: transcoderConfig,
  })
    .then((res) => {
      if (!res.data.droplet) return null;
      const droplet = res.data.droplet;
      console.info(`Created a droplet: ${droplet.name} | ${droplet.id}`);
      return droplet.id;
    })
    .catch((e) => {
      console.error(e);
      return null;
    });
  return dropletId;
};

module.exports.deleteDroplet = async (dropletId) => {
  const success = await axios({
    url: `https://api.digitalocean.com/v2/droplets/${dropletId}`,
    method: "DELETE",
    headers: {
      authorization: `Bearer ${config.digitalocean.api_key}`,
    },
  })
    .then(async (res) => {
      if (!res.status >= 400) return null;
      console.info(`Deleted ${dropletId} droplet`);
      return true;
    })
    .catch((e) => {
      console.error(e);
      return null;
    });
  return success;
};
