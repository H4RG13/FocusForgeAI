// Web Audio API chime — no audio files needed
export function playChime() {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new AudioContext();
    // Play C5 → E5 → G5 arpeggio
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      osc.start(t);
      osc.stop(t + 1.2);
    });
  } catch {
    // AudioContext blocked (e.g. no user gesture yet) — silently ignore
  }
}

export function sendNotification(title: string, body: string) {
  if (typeof window === 'undefined') return;
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
}

export async function requestNotificationPermission() {
  if (typeof window === 'undefined') return;
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
}
