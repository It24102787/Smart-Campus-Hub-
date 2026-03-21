const API_BASE = process.env.API_BASE || 'http://localhost:8080/api';

const cardTaps = [
  { cardUid: '04A8C13299', deviceId: 'RFID-LIB-01' },
  { cardUid: '04F1B8731A', deviceId: 'RFID-IT-01' }
];

const envReadings = [
  { sensorDeviceId: 'LIB-01', temperature: 26.8, occupancyCount: 3 },
  { sensorDeviceId: 'IT-01', temperature: 27.4, occupancyCount: 7 },
  { sensorDeviceId: 'NB-01', temperature: 28.9, occupancyCount: 8 }
];

async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function runSimulation() {
  console.log('Sending simulated card taps...');
  for (const tap of cardTaps) {
    try {
      const result = await post('/iot/card-tap', tap);
      console.log('card-tap', tap, '=>', result);
    } catch (err) {
      console.error('card-tap failed', tap, err.message);
    }
  }

  console.log('\nSending simulated environment readings...');
  for (const reading of envReadings) {
    try {
      const result = await post('/iot/environment-reading', reading);
      console.log('environment-reading', reading, '=>', result);
    } catch (err) {
      console.error('environment-reading failed', reading, err.message);
    }
  }
}

runSimulation().catch((err) => {
  console.error('Simulation crashed:', err);
  process.exitCode = 1;
});
