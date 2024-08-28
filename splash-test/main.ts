import { app, BrowserWindow } from 'electron';
import path from 'path';
import os from 'os';
import { getWindow, getStartURL, dispatchEvent } from '../src/splash';
import { downloadFile, niceBytes } from '../src/download';

const downloadURL =
  'https://github.com/electron-delta/electron-sample-app/releases/download/v0.0.86/electron-sample-app-0.0.84-to-0.0.86-delta.exe';

let updaterWindow: BrowserWindow | null;

app.on('ready', () => {
  updaterWindow = getWindow();
  updaterWindow.loadURL(getStartURL());

  setTimeout(() => {
    console.log('checking for update');
    dispatchEvent(updaterWindow, 'checking-for-update');
  }, 1000);

  setTimeout(() => {
    console.log('update available');
    dispatchEvent(updaterWindow, 'update-available');
  }, 2000);

  setTimeout(async () => {
    await downloadFile(
      downloadURL,
      path.join(os.tmpdir(), `${Math.random()}.zip`),
      ({ percentage, transferred, total }) => {
        console.log(`downloading ${transferred}/${total} (${percentage}%)`);
        dispatchEvent(updaterWindow, 'download-progress', {
          percentage: parseFloat(percentage).toFixed(1),
          transferred: niceBytes(transferred),
          total: niceBytes(total),
        });
      }
    );

    console.log('download complete');
    dispatchEvent(updaterWindow, 'update-downloaded');
  }, 3000);
});
