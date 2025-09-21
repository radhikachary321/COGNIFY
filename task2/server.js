// server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Temporary in-memory storage (demo only)
const submissions = [];

/**
 * Server-side validation - mirrors client rules.
 * Returns an object of errors (empty if no errors).
 */
function validateSubmission(data) {
  const errors = {};

  const name = (data.name || '').trim();
  const email = (data.email || '').trim();
  const age = data.age === undefined ? '' : String(data.age).trim();
  const skills = Array.isArray(data.skills) ? data.skills : (data.skills ? [data.skills] : []);
  const message = (data.message || '').trim();
  const availability = (data.availability || '').trim();
  const terms = data.termsAccepted === true || data.termsAccepted === 'true' || data.termsAccepted === 'on';

  if (name.length < 2) errors.name = 'Name must be at least 2 characters.';
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Enter a valid email.';
  const ageNum = Number(age);
  if (!age || isNaN(ageNum) || ageNum < 0 || ageNum > 120) errors.age = 'Enter a valid age (0–120).';
  if (skills.length === 0) errors.skills = 'Select at least one skill.';
  if (message.length < 10) errors.message = 'Message must be at least 10 characters.';
  if (!availability) {
    errors.availability = 'Select an availability date.';
  } else {
    const avDate = new Date(availability);
    const today = new Date();
    // zero time for comparison
    avDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    if (isNaN(avDate.getTime())) {
      errors.availability = 'Availability date is invalid.';
    } else if (avDate < today) {
      errors.availability = 'Availability cannot be in the past.';
    }
  }
  if (!terms) errors.termsAccepted = 'You must accept terms to continue.';

  return errors;
}

app.post('/api/submit', (req, res) => {
  const data = req.body;
  const errors = validateSubmission(data);
  if (Object.keys(errors).length) {
    return res.status(400).json({ success: false, errors });
  }

  const id = submissions.length + 1;
  const record = {
    id,
    name: data.name.trim(),
    email: data.email.trim(),
    age: Number(data.age),
    skills: Array.isArray(data.skills) ? data.skills : (data.skills ? [data.skills] : []),
    experience: data.experience || '',
    role: data.role || '',
    availability: data.availability,
    message: data.message.trim(),
    receivedAt: new Date().toISOString()
  };

  submissions.push(record);
  return res.json({ success: true, record });
});

// debug route to view stored submissions (returns JSON)
app.get('/api/submissions', (req, res) => {
  res.json({ submissions });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});