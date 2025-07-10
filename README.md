# Audio RT Tester GUI for Volumio

A simple web-based GUI for running real-time audio latency tests on your Volumio device.

## Prerequisites

- Volumio (any recent release)  
- Node.js (v18 or newer)  
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


````markdown
# Audio RT Tester GUI for Volumio

A simple web-based GUI for running real-time audio latency tests on your Volumio device.

## Prerequisites

- Volumio (any recent release)  
- Node.js (v18 or newer)  
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

Install the native real-time test tools before running the GUI:

```bash
sudo apt-get update

# Install cyclictest (from rt-tests)
sudo apt-get install -y rt-tests

# Install or build jitterdebugger
if ! command -v jitterdebugger &> /dev/null; then
  sudo apt-get install -y jitterdebugger || {
    git clone https://git.kernel.org/pub/scm/utils/kernel/jitter-debugger.git
    cd jitter-debugger
    make
    sudo install -m 0755 jitterdebugger /usr/local/bin/
    cd ..
    rm -rf jitter-debugger
  }
fi
```

* **cyclictest**: measures kernel wake-up latency
* **jitterdebugger**: analyzes block-level timing jitter

## Usage

Start the web server and open the GUI:

```bash
cd /srv/node/audio-rt-tester
node server.js
```

Then point your browser to:

```
http://<VOLIMIO_HOST_OR_IP>:3003
```

You’ll see controls to launch `cyclictest` and `jitterdebugger`, live graphs of latency, and options to download raw logs.

## Configuration

* **Change listening port**

  ```bash
  PORT=4000 node server.js
  ```

  or export `PORT=4000` in your shell.

* **Custom results directory**
  Edit the `RESULT_DIR` constant at the top of `server.js` to change where test logs are saved.

## Running on Boot

Create a systemd service to launch the GUI at startup:

```ini
# /etc/systemd/system/audio-rt-tester.service
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
WantedBy=multi-user-target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable audio-rt-tester
sudo systemctl start audio-rt-tester
```

## Directory Structure

```
audio-rt-tester/
├── server.js           # Express server & test launcher
├── public/             # Static CSS/JS for the GUI
├── views/              # Optional templates (e.g. Pug)
├── results/            # Generated logs & CSV exports
├── package.json
└── package-lock.json
```

## Troubleshooting

* **Port already in use**
  Change the `PORT` or stop the conflicting service.
* **cyclictest permission denied**
  Grant real-time privileges in `/etc/security/limits.conf`.
* **Graphs not loading**
  Check browser console for 404s and verify `public/` asset paths.

## Contributing

1. **Fork** the repo
2. **Create** a feature branch:

   ```bash
   git checkout -b feature/xyz
   ```
3. **Commit** your changes:

   ```bash
   git commit -m "Add xyz"
   ```
4. **Push** and **open** a Pull Request

Follow the [GitHub flow](https://guides.github.com/introduction/flow/) and keep each PR focused on a single change.

## License

This project is licensed under the **ISC License**.
See [LICENSE](LICENSE) for full details.

```
```
