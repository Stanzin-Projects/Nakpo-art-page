/**
 * Alert helpers for the admin dashboard: a short synthesised chime (no audio
 * file to load) and a desktop notification via the Notification API.
 */

let audioContext = null;

/** A two-note "ka-ching" built with the Web Audio API. Silently does nothing if blocked. */
export function playOrderChime() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!audioContext) audioContext = new AC();
    if (audioContext.state === 'suspended') audioContext.resume();

    const now = audioContext.currentTime;
    const notes = [
      { freq: 987.77, at: 0 }, // B5
      { freq: 1318.51, at: 0.12 }, // E6
    ];

    for (const note of notes) {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'triangle';
      osc.frequency.value = note.freq;

      // quick attack, smooth decay — a bell rather than a beep
      gain.gain.setValueAtTime(0.0001, now + note.at);
      gain.gain.exponentialRampToValueAtTime(0.18, now + note.at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.at + 0.55);

      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(now + note.at);
      osc.stop(now + note.at + 0.6);
    }
  } catch {
    /* audio unavailable or blocked before a user gesture */
  }
}

export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function notificationPermission() {
  return notificationsSupported() ? Notification.permission : 'unsupported';
}

export async function requestNotificationPermission() {
  if (!notificationsSupported()) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

/**
 * Show a desktop notification for a new order. Only fires when the dashboard
 * is in the background — when it is visible the in-page toast is the alert.
 */
export function showOrderNotification(data) {
  if (!notificationsSupported() || Notification.permission !== 'granted') return false;
  if (!document.hidden) return false;
  try {
    const money = '₹' + Number(data.total || 0).toLocaleString('en-IN');
    const notification = new Notification(`New order ${data.orderNumber}`, {
      body: `${money} from ${data.customer}${data.items ? ` · ${data.items} piece${data.items === 1 ? '' : 's'}` : ''}`,
      tag: data.id || data.orderNumber,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    return true;
  } catch {
    return false;
  }
}
