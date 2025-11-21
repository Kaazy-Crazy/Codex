const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

let attendees = [];
let nextId = 1;

const validateAttendee = (data) => {
  const errors = [];
  if (!data.name || !data.name.trim()) {
    errors.push('氏名は必須です。');
  }
  if (data.guests !== undefined && (isNaN(data.guests) || Number(data.guests) < 1)) {
    errors.push('同行者人数は1以上の数値で入力してください。');
  }
  return errors;
};

app.get('/api/attendees', (req, res) => {
  res.json(attendees);
});

app.post('/api/attendees', (req, res) => {
  const { name, email = '', phone = '', ticketType = 'standard', guests = 1, note = '' } = req.body;
  const errors = validateAttendee({ name, guests });

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const attendee = {
    id: nextId++,
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    ticketType,
    guests: Number(guests) || 1,
    note: note.trim(),
    checkedIn: false,
    createdAt: new Date().toISOString(),
    checkedInAt: null
  };

  attendees.push(attendee);
  res.status(201).json(attendee);
});

app.patch('/api/attendees/:id/checkin', (req, res) => {
  const id = Number(req.params.id);
  const attendee = attendees.find((item) => item.id === id);

  if (!attendee) {
    return res.status(404).json({ message: '対象の来場者が見つかりませんでした。' });
  }

  const { checkedIn } = req.body;
  attendee.checkedIn = Boolean(checkedIn);
  attendee.checkedInAt = attendee.checkedIn ? new Date().toISOString() : null;

  res.json(attendee);
});

app.delete('/api/attendees/:id', (req, res) => {
  const id = Number(req.params.id);
  const exists = attendees.some((item) => item.id === id);

  attendees = attendees.filter((item) => item.id !== id);

  if (!exists) {
    return res.status(404).json({ message: '対象の来場者が見つかりませんでした。' });
  }

  res.status(204).send();
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    attendeeCount: attendees.length
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
