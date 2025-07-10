const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const app = express();
app.use(express.json());
app.use(express.static('public'));

// Cyclictest quick summary parser
function parseCyclicSummary(log) {
  const reg = /T:\s*(\d+).*?Min:\s+(\d+).*?Avg:\s+(\d+).*?Max:\s+(\d+)/g;
  let m, result = {};
  while ((m = reg.exec(log)) !== null) {
    result[m[1]] = { min: Number(m[2]), avg: Number(m[3]), max: Number(m[4]) };
  }
  return Object.keys(result).length ? result : null;
}

// Cyclictest detail: just extract min/avg/max (last) per core
function parseCyclicDetail(log) {
  const min = log.match(/# Min Latencies:\s*(.*)/);
  const avg = log.match(/# Avg Latencies:\s*(.*)/);
  const max = log.match(/# Max Latencies:\s*(.*)/);
  if (!min || !avg || !max) return null;
  const parseArr = s => s.trim().split(/\s+/).map(Number);
  let res = [];
  parseArr(min[1]).forEach((v, i) =>
    res.push({ core: i, min: v, avg: parseArr(avg[1])[i], max: parseArr(max[1])[i] })
  );
  return res.length ? res : null;
}

// Jitterdebugger block parser (min/avg/max series for each core)
// function parseJitterBlocks(log) {
  // const result = {};
  // const reg = /T:\s*(\d+).*?Min:\s+(\d+).*?Avg:\s+([\d.]+).*?Max:\s+(\d+)/g;
  // let m;
  // while ((m = reg.exec(log)) !== null) {
    // const core = m[1];
    // if (!result[core]) result[core] = [];
    // result[core].push({
      // min: Number(m[2]),
      // avg: Number(m[3]),
      // max: Number(m[4])
    // });
  // }

  // const summary = {};
  // Object.entries(result).forEach(([core, arr]) => {
    // summary[core] = { block: arr.length, ...arr[arr.length-1] };
  // });
  // return { blocks: result, summary };
// }
function parseJitterBlocks(log) {
  const result = {};
  const reg = /T:\s*(\d+).*?Min:\s+(\d+).*?Avg:\s+([\d.]+).*?Max:\s+(\d+)/g;
  let m;
  while ((m = reg.exec(log)) !== null) {
    const core = m[1];
    if (!result[core]) result[core] = [];
    result[core].push({
      min: Number(m[2]),
      avg: Number(m[3]),
      max: Number(m[4])
    });
  }
  // summary: last block of each core
  const summary = {};
  Object.entries(result).forEach(([core, arr]) => {
    summary[core] = { block: arr.length, ...arr[arr.length-1] };
  });
  return { blocks: result, summary };
}

app.post('/test', (req, res) => {
  const { testType, mode, params } = req.body;
  let cmd = '', logPath = '';
  if (testType === 'cyclictest') {
    const coreArg = params.cores ? `-a ${params.cores}` : '-a 0-3';
    if (mode === 'quick') {
      cmd = `sudo cyclictest -m -p ${params.priority || 99} -i ${params.interval || 250} ${coreArg} -l ${params.loops || 200000} -q > /tmp/cyclictest.log`;
      logPath = '/tmp/cyclictest.log';
    } else {
      cmd = `sudo cyclictest -m --policy=${params.policy || 'rr'} -p ${params.priority || 99} -i ${params.interval || 100} -h ${params.histogram || 400} -l ${params.loops || 83470} -t ${params.threads || 4} ${coreArg} -q -v > /tmp/cyclictest_detail.log`;
      logPath = '/tmp/cyclictest_detail.log';
    }
  } else if (testType === 'jitterdebugger') {
    const coreArg = params.cores ? `-a ${params.cores}` : '-a 0-3';
    cmd = `sudo jitterdebugger ${coreArg} -l ${params.loops || 30000} -v > /tmp/jitterdebugger.log`;
    logPath = '/tmp/jitterdebugger.log';
  } else {
    return res.status(400).json({ error: "Unknown testType" });
  }
  exec(cmd, { timeout: 360000 }, (error) => {
    if (error) return res.status(500).json({ error: error.toString() });
    fs.readFile(logPath, 'utf8', (err, data) => {
      if (err) return res.status(500).json({ error: 'Failed to read log file' });
      if (testType === 'cyclictest') {
        if (mode === 'quick') {
          const summary = parseCyclicSummary(data);
          if (!summary) return res.status(400).json({ error: 'No usable data in log.' });
          return res.json({ mode: 'cyclic-quick', summary });
        } else {
          const parsed = parseCyclicDetail(data);
          if (!parsed) return res.status(400).json({ error: 'No usable data in log.' });
          return res.json({ mode: 'cyclic-detail', summary: parsed });
        }
      }
      if (testType === 'jitterdebugger') {
        const parsed = parseJitterBlocks(data);
        if (!parsed || !parsed.blocks) return res.status(400).json({ error: 'No usable data in log.' });
        return res.json({ mode: 'jitter', ...parsed });
      }
      res.status(400).json({ error: 'Unhandled' });
    });
  });
});

app.get('/log', (req, res) => {
  let file;
  if (req.query.type === 'cyclictest' && req.query.mode === 'detail')
    file = '/tmp/cyclictest_detail.log';
  else if (req.query.type === 'cyclictest')
    file = '/tmp/cyclictest.log';
  else
    file = '/tmp/jitterdebugger.log';
  res.download(file);
});

app.listen(3003, () => console.log('RT Tester running on http://localhost:3003'));
