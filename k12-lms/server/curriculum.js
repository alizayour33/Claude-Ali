'use strict';
// K-12 grade ladder and subjects. Edit here to change the catalogue.

const GRADES = [
  { id: 'K', name: 'Kindergarten', band: 'Elementary', age: 5 },
  ...Array.from({ length: 12 }, (_, i) => {
    const g = i + 1;
    return {
      id: String(g),
      name: `Grade ${g}`,
      band: g <= 5 ? 'Elementary' : g <= 8 ? 'Middle School' : 'High School',
      age: g + 5,
    };
  }),
];

const SUBJECTS = [
  { id: 'science', name: 'Science', color: '#0e9f6e' },
  { id: 'math', name: 'Mathematics', color: '#3f6fd8' },
  { id: 'english', name: 'English Language Arts', color: '#c2410c' },
  { id: 'social', name: 'Social Studies', color: '#9333ea' },
  { id: 'arts', name: 'Arts & Music', color: '#db2777' },
  { id: 'pe', name: 'Physical Education & Health', color: '#0891b2' },
];

const gradeById = (id) => GRADES.find((g) => g.id === String(id));
const subjectById = (id) => SUBJECTS.find((s) => s.id === id);

module.exports = { GRADES, SUBJECTS, gradeById, subjectById };
