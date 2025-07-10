````markdown
# Audio RT Tester GUI for Volumio

A simple web-based GUI for running real-time audio latency tests on your Volumio device.

## Prerequisites

- Volumio
- Git

## Installation

SSH into your Volumio device and run:

```bash
sudo mkdir -p /srv/node
sudo chown volumio:volumio /srv/node
cd /srv/node
git clone https://github.com/lovehifi/audio-rt-tester
cd audio-rt-tester
npm install
````

## Tool Dependencies

```bash
sudo apt-get update
sudo apt-get install -y rt-tests

if ! command -v jitterdebugger &> /dev/null; then
  sudo apt-get install -y jitterdebugger || {
    git clone https://git.kernel.org/pub/scm/utils/kernel/jitter-debugger.git
    cd jitter-debugger && make
    sudo install -m 0755 jitterdebugger /usr/local/bin/
    cd .. && rm -rf jitter-debugger
  }
fi
```

## Usage

```bash
cd /srv/node/audio-rt-tester
node server.js
```

Open your browser to `http://<VOLIMIO_HOST_OR_IP>:3003`

## Configuration

* Change port:

  ```bash
  PORT=4000 node server.js
  ```
* Edit `RESULT_DIR` in `server.js` to change where logs are saved.

## Running on Boot

Create `/etc/systemd/system/audio-rt-tester.service`:

```ini
[Unit]
Description=Audio RT Tester GUI
After=network.target

[Service]
User=volumio
WorkingDirectory=/srv/node/audio-rt-tester
Environment=PORT=3003
ExecStart=/usr/bin/node /srv/node/audio-rt-tester/server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable audio-rt-tester
sudo systemctl start audio-rt-tester
```

## Directory Structure

```
audio-rt-tester/
├── server.js
├── public/
├── views/
├── results/
├── package.json
└── package-lock.json
```

## Troubleshooting

* **Port in use**: change `PORT` or stop conflicting service.
* **cyclictest permission**: grant real-time limits in `/etc/security/limits.conf`.
* **No graphs**: check browser console and static asset paths.

## Contributing

1. Fork → 2. Branch → 3. Commit → 4. PR
   Follow [GitHub flow](https://guides.github.com/introduction/flow/).

## License

ISC License – see [LICENSE](LICENSE).

```
```
