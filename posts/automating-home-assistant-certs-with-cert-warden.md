---
title: 'Automating Home Assistant Certs with Cert Warden'
date: '2025-08-24'
excerpt: "Automating Home Assistant Certs with Cert Warden, Let's Encrypt, and working around Home Assistants Security"
tags: ['Home Assistant', 'SSL', 'Certificates', 'Automation', 'Security']
author: 'Wesley Kirkland'
---

# The Why

The CA/B Forum this year has announced by 2029-05-15 SSL Certs will only be valid for a maximum validity of 47 days. You can see this [here](https://cabforum.org/working-groups/server/baseline-requirements/requirements/#122-relevant-dates) under [6.3.2](https://cabforum.org/working-groups/server/baseline-requirements/requirements/#632-certificate-operational-periods-and-key-pair-usage-periods) I've given multiple presentations locally and with [Urllo](https://urllo.com/) about the importance of this. We're currently in the process of publishing a blog post about this issuefrom my webinar.

# The Reason

In my environment I run [Split Brain DNS](https://tailscale.com/learn/why-split-dns#what-is-split-dns), which means if I resolve ha.example.com internally it will resolve 10.0.1.100 and externally it will resolve 184.70.140.38, for example. The Home Assistant mobile app actually supports much simpler setups where on specific WiFi SSIDs it will use a different internal URL. Though I have a degree in network engineering, I'm going to do this in the most robust way! Which in my case means I can be on my internal network or externally and type https://ha.example.com and resolve to the correct IP on the backend no matter what network I am on.

# The Limitiations

While Home Assistant is amazing and it runs my daily life, it's designed for the average home user by giving them the tools they need to automate their lives through simplicity. This simplicity comes at a cost of real world tools/techniques being left out as I'll demonstrate in this article. A famous example of this is the lack of federated authentication within Home Assistant as outlined [here](https://github.com/home-assistant/architecture/issues/832#issuecomment-1328052330).

Specifically for this article the real limitation I had was the removal of stdin to the SSH addon service from a security perspective which was purely social engineering outlined in [PR #349](https://github.com/hassio-addons/addon-ssh/pull/349).

# Implementation

Note: This guide assumes you have a working knowledge of Home Assistant, Cert Warden and the basics of SSL. Additionally it assumes you have a working Cert Warden Instance. If you do not my Docker compose file is provided [here](/images/blog/2025/automating-home-assistant-certs-with-cert-warden/certwarden.yaml) for your reference and it includes Traefik for SSL termination.

## SSL Automation - Home Assistant

Notes: Some knowledge before we get started, in this implementation, we do have API keys stored on disk. This is not ideal, utilizing a secrets manager of sorts would be more ideal. The only other method Home Assistant natively offers is secrets.yaml, in which we could build an integration for our script. The other option is to pass our API keys as ENVs vars from Cert Warden through the chain. In either case it's out of scope for this article, though I may investigate this in the future. The additional security isn't much better as Cert Warden APIs are limited to the certificate and private key download and not full system access. Additionally Cert Warden is not an HSM and these keys are stored in a SQLLite database. I do not consider this an enterprise worthy solution.

1. We can NOT run this as a normal automation as `/ssl` is locked out to us. I tried running it with elevated access to supervisor however privilege escalation is not available to us in this method either, nor can we reload docker containers in this method.
1. Install the [SSH addon](https://community.home-assistant.io/t/home-assistant-community-add-on-ssh-web-terminal/33820)
1. Disable protection mode in the addon configuration `protection_mode: false   # Needed to write to /ssl and run HA CLI`, and restart the addon.
1. Using SSH or the VS Code addon add the following script to `/config/scripts/update_cert.sh`.
   1. For `API_KEY_CERT` this is the API key from the certificate in Cert Warden.
   1. For `API_KEY_PRIVATE` this is hidden in the console and you need to navigate to Private Keys and select your Home Assistant private key and copy it's API key.

This script is executed by Cert Warden via SSH to pull the cert from Cert Warden, installs it in Home Assistant, and restarts the Nginx Proxy Manager Addon.

```bash
#!/bin/bash

# Config
CERT_NAME="HomeAssistant"    # Your Cert Warden cert name
BASE_URL="https://certwarden.example.com/certwarden/api/v1"
API_KEY_CERT="INSERTYOURCERTKEY"
API_KEY_PRIVATE="INSERTYOURPRIVATEKEY"
CERT_DIR="/ssl" # Where HA expects SSL certs
CERT_FILE="${CERT_DIR}/cert.pem"
KEY_FILE="${CERT_DIR}/key.pem"

# Temp files
TMP_CERT=$(mktemp)
TMP_KEY=$(mktemp)

# Download certificate (PEM with chain)
curl -s -H "X-API-Key: ${API_KEY_CERT}" \
    "${BASE_URL}/download/certificates/${CERT_NAME}" > "${TMP_CERT}"

# Download private key
curl -s -H "X-API-Key: ${API_KEY_PRIVATE}" \
    "${BASE_URL}/download/privatekeys/${CERT_NAME}" > "${TMP_KEY}"

# Verify non-empty
if [ ! -s "$TMP_CERT" ] || [ ! -s "$TMP_KEY" ]; then
    echo "❌ Failed to download cert or key"
    rm -f "$TMP_CERT" "$TMP_KEY"
    exit 1
fi

# Check if cert changed
if cmp -s "$TMP_CERT" "$CERT_FILE" && cmp -s "$TMP_KEY" "$KEY_FILE"; then
    echo "ℹ️ Certificate unchanged, nothing to do"
    echo "SSL run, not updated" > /config/ssl.log
else
    echo "✅ Certificate updated, installing..."
    echo "SSL Updated $(date)" > /config/ssl.log
    cp "$TMP_CERT" "$CERT_FILE"
    cp "$TMP_KEY" "$KEY_FILE"
    # Restart only if cert changed
    ha addons restart core_nginx_proxy
fi

# Cleanup
rm -f "$TMP_CERT" "$TMP_KEY"
```

5. On Cert Warden login docker exec into the file system.
   1. Run `apk add --no-cache openssh` # We need to install openssh as it's not included by default with Cert Warden.
   1. `cd /app/data` and run `ssh-keygen` and use the default filename of `id_ed25519`.
      1. I tried to create a key locally on my laptop though Alpine failed to register it properly due to different formats.

## SSL Automation - Cert Warden

Note: We need to utilize Cert Wardens post processing abilities to bypass Home Assistants lack of stdin to the SSH container as this is the only method I found to automate the cert renewal process. Home Assistant officially only states that SSH is an option for this kind of automation.

1. Within Cert Warden under your docker mount create a `scripts` folder and create a script named `cert_homeassistant.sh` with the following contents. We have an if logic condition to install openssh on run if it's not installed as openssh isn't included with Cert Warden by default.

This script is executed by Cert Warden to SSH int Home Assistant to execute the script we created earlier.

```bash
#!/bin/bash
# Variables from Cert Warden
HA_HOST="ha.example.com"
HA_USER="root"
SSH_KEY="/app/data/app/id_ed25519"
SSH_PORT=2222

# Install SSH if missing
if ! command -v ssh >/dev/null 2>&1; then
    apk add --no-cache openssh
fi

# Run remote script via SSH
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -p "$SSH_PORT" "$HA_USER@$HA_HOST" \
    "bash /config/scripts/update_cert.sh"
SSH_EXIT=$?

# Propagate exit code to Cert Warden
if [ $SSH_EXIT -eq 0 ]; then
    echo "✅ Remote HA script executed successfully"
else
    echo "❌ Remote HA script failed with exit code $SSH_EXIT"
fi

exit $SSH_EXIT
```

6. From within Cert Warden on the Certificate add a post processing action with the following path `./data/scripts/cert_homeassistant.sh`
   1. If you use an NFS mount you may need to login to your NFS file system and manually `chmod +x` the script on the NFS mount and `chmod 600` the ssh key.
1. From the Certificate in Cert Warden click on post processing and check the logs for errors.

## SSL Proxy in Home Assistant

1. This is crucial for Home Assistant, in my setup I need to offer SSL and non SSL (I'm looking at you [Ecowitt](https://www.home-assistant.io/integrations/ecowitt/)). We can accommodate this with the [Nginx Proxy Manager](https://github.com/hassio-addons/addon-nginx-proxy-manager) Addon. If you do not need to offer non SSL you can edit the script to restart Home Assistant as a whole instead of the proxy container. Though I can tell you in enterprise environments reverse proxies are more common than you think for SSL termination.
1. In the proxy configuration it should look like the following except with your domain.
   ![Nginx Proxy Manager Configuration](/images/blog/2025/automating-home-assistant-certs-with-cert-warden/ha_nginx.png 'Nginx Proxy Manager Configuration')
1. Start the proxy manager Addon.

## Verification

1. You can verify the cert with `echo | openssl s_client -connect ha.example.com:443 -servername ha.example.com 2>/dev/null | openssl x509 -noout -issuer`.
