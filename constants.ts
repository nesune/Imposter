
import { Category, WordPair } from './types';

export const CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Drinks', emoji: '🍕', description: 'Delicious treats and beverages' },
  { id: 'places', name: 'Places', emoji: '🌍', description: 'Cities, landmarks, and locations' },
  { id: 'animals', name: 'Animals', emoji: '🦁', description: 'Wild and domestic creatures' },
  { id: 'objects', name: 'Daily Objects', emoji: '🎒', description: 'Things you see every day' },
  { id: 'jobs', name: 'Professions', emoji: '👨‍⚕️', description: 'Careers and hobbies' },
  { id: 'ai', name: 'AI Surprise', emoji: '✨', description: 'Gemini generates a custom theme' }
];

export const STATIC_WORDS: Record<string, WordPair[]> = {
  food: [
    { target: 'Pizza', decoy: 'Pasta' },
    { target: 'Ice Cream', decoy: 'Frozen Yogurt' },
    { target: 'Coffee', decoy: 'Tea' },
    { target: 'Hamburger', decoy: 'Hot Dog' },
    { target: 'Sushi', decoy: 'Ramen' },
    { target: 'Cake', decoy: 'Cupcake' }
  ],
  places: [
    { target: 'Library', decoy: 'Bookstore' },
    { target: 'Cinema', decoy: 'Theater' },
    { target: 'Beach', decoy: 'Lake' },
    { target: 'Airport', decoy: 'Train Station' },
    { target: 'Museum', decoy: 'Art Gallery' },
    { target: 'Hospital', decoy: 'Clinic' }
  ],
  animals: [
    { target: 'Tiger', decoy: 'Lion' },
    { target: 'Dolphin', decoy: 'Whale' },
    { target: 'Eagle', decoy: 'Hawk' },
    { target: 'Crocodile', decoy: 'Alligator' },
    { target: 'Elephant', decoy: 'Mammoth' },
    { target: 'Penguin', decoy: 'Puffin' }
  ],
  objects: [
    { target: 'Smartphone', decoy: 'Tablet' },
    { target: 'Pencil', decoy: 'Pen' },
    { target: 'Bicycle', decoy: 'Scooter' },
    { target: 'Glasses', decoy: 'Sunglasses' },
    { target: 'Hammer', decoy: 'Screwdriver' },
    { target: 'Watch', decoy: 'Clock' }
  ],
  jobs: [
    { target: 'Doctor', decoy: 'Nurse' },
    { target: 'Pilot', decoy: 'Astronaut' },
    { target: 'Chef', decoy: 'Baker' },
    { target: 'Firefighter', decoy: 'Police Officer' },
    { target: 'Teacher', decoy: 'Professor' },
    { target: 'Athlete', decoy: 'Coach' }
  ]
};
