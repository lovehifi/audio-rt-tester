
# Audio RT Tester GUI for Volumio

A simple web-based GUI for running real-time audio latency tests on your Volumio device.


## Prerequisites

**Volumio with real-time kernel**  
  1. Clone Volumio’s build scripts and platform repo:  
     ```bash
     git clone https://github.com/volumio/build-platform-x64.git
     cd build-platform-x64
     ```
  2. Build and install a PREEMPT_RT kernel.  
  3. Reboot into your new kernel and verify:  
     ```bash
     uname -a
     # → Linux volumio 6.12.xx-volumio-rt PREEMPT_RT ...
     ```  
     **Must** show `PREEMPT_RT`, not `PREEMPT_DYNAMIC` or unpatched.


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

```
```

![Test UI Screenshot 1](https://raw.githubusercontent.com/lovehifi/audio-rt-tester/main/test_ui_01.png)  
![Test UI Screenshot 2](https://raw.githubusercontent.com/lovehifi/audio-rt-tester/main/test_ui_02.png)
