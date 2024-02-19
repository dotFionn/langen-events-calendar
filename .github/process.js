import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import ics from 'ics';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

function readJson(fileName) {
  const str = fs.readFileSync(path.join(__dirname, fileName), { encoding: 'utf8' });
  return JSON.parse(str);
}

const events = readJson('../events.json');
const reminders = readJson('../reminders.json');

const entries = [];
for (const event of events) {
  for (const reminder of reminders) {
    const baseDate = new Date(event.date);
    const reminderDate = new Date(baseDate);
    reminderDate.setDate(reminderDate.getDate() - reminder.days);
    entries.push({
      title: `Reminder: ${event.name} - ${reminder.title}`,
      start: [
        reminderDate.getUTCFullYear(),
        reminderDate.getUTCMonth() + 1,
        reminderDate.getUTCDate(),
        reminderDate.getUTCHours(),
        reminderDate.getUTCMinutes(),
        reminderDate.getUTCSeconds()
      ],
      duration: { hours: 1 }
    });
  }
}

const {error, value} = ics.createEvents(entries);

if (error) {
  console.error(error);
  process.exit(1);
}

fs.writeFileSync(path.join(__dirname, '..', 'events.ics'), value);
process.exit(0);
