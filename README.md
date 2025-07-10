# Real-time Test (GUI) for Volumio

A simple web-based GUI for running real-time audio latency tests on your Volumio device.

## Prerequisites

- **Volumio** (any recent release)
- **Node.js** (v18 or newer)
- **Git**

## Installation

SSH into your Volumio device and run:

```bash
sudo mkdir -p /srv/node
sudo chown volumio:volumio /srv/node
cd /srv/node
git clone https://github.com/lovehifi/audio-rt-tester
cd audio-rt-tester
npm install
