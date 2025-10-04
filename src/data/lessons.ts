export interface Lesson {
  id: number;
  title: string;
  description: string;
  explorerFeature: string;
}

export const lessonData: Lesson[] = [
  {
    id: 1,
    title: 'How fast is the ISS?',
    description:
      'Learn about the ISS’s orbital speed of 27,571 km/h and its 90-minute Earth orbit.',
    explorerFeature: 'orbit-speed',
  },
  {
    id: 2,
    title: 'Why 16 Sunsets per Day?',
    description: 'Discover why astronauts see 16 sunrises and sunsets each day aboard the ISS.',
    explorerFeature: 'day-night-cycle',
  },
  {
    id: 3,
    title: 'Cupola: Astronaut’s Window',
    description: 'Explore Earth from the ISS Cupola, a 360° observatory window for astronauts.',
    explorerFeature: 'cupola-view',
  },
  {
    id: 4,
    title: 'Auroras from Space',
    description: 'See stunning auroras from the ISS perspective and learn what causes them.',
    explorerFeature: 'aurora',
  },
];
