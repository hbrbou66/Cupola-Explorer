export interface Lesson {
  id: number;
  title: string;
  description: string;
  details: string;
  explorerFeature: string;
}

export const lessonData: Lesson[] = [
  {
    id: 1,
    title: 'How fast is the ISS?',
    description:
      'Learn about the ISS’s orbital speed of 27,571 km/h and its 90-minute Earth orbit.',
    details:
      'The International Space Station hurtles around Earth at a remarkable 27,571 kilometers per hour (17,150 mph). That velocity is fast enough to cross the continental United States in about ten minutes, keeping the laboratory in constant free fall around the planet. Because astronauts live in a perpetual state of microgravity, the station’s speed is critical to maintaining its stable orbit.\n\nTraveling this quickly means the station completes an orbit roughly every 90 minutes. Astronauts aboard the ISS therefore transition from sunlight to darkness dozens of times per day, experiencing sunrise or sunset approximately every 45 minutes. Mission controllers must carefully plan activities to match this relentless rhythm.\n\nMaintaining the precise orbital speed also protects the station from atmospheric drag. Small engine burns are scheduled to counter the thin traces of Earth’s atmosphere that still brush the ISS at its altitude, ensuring it remains high enough to avoid re-entry.',
    explorerFeature: 'orbit-speed',
  },
  {
    id: 2,
    title: 'Why 16 Sunsets per Day?',
    description: 'Discover why astronauts see 16 sunrises and sunsets each day aboard the ISS.',
    details:
      'Because the ISS loops around Earth every 90 minutes, crew members witness daybreak and nightfall many times during a single shift. Each orbit carries the station through alternating arcs of daylight and darkness, resulting in about 16 sunrises and 16 sunsets every 24 hours. The spectacle paints the horizon with vivid colors that race across the windows in mere moments.\n\nThis rapid light cycle can challenge human circadian rhythms. Astronauts rely on carefully programmed lighting inside the station, along with strict sleep schedules, to signal to their bodies when it is time to rest. Mission planners also choreograph activities to minimize fatigue, particularly during spacewalk preparations when alertness is vital.\n\nStudying how the body adapts to these rapid transitions helps scientists design lighting systems and routines for future deep-space missions. Lessons learned from the ISS inform how crews might live on voyages to the Moon, Mars, and beyond.',
    explorerFeature: 'day-night-cycle',
  },
  {
    id: 3,
    title: 'Cupola: Astronaut’s Window',
    description: 'Explore Earth from the ISS Cupola, a 360° observatory window for astronauts.',
    details:
      'The Cupola module is a seven-window observatory perched on the ISS that provides astronauts with a sweeping panorama of Earth and space. Its central round window is the largest ever flown on a spacecraft, allowing crew members to admire swirling weather systems, glowing city lights, and the thin blue line of Earth’s atmosphere.\n\nBeyond its unmatched view, the Cupola is a functional workstation. Astronauts use it to operate the Canadarm2 robotic arm, monitor visiting spacecraft, and oversee spacewalks. The surrounding equipment consoles glow with instrument readouts, framing Earth’s beauty with the practical tools of orbital operations.\n\nThe Cupola has also become an iconic venue for photography. Images captured here help scientists track natural events like hurricanes, volcanic eruptions, and glacial changes, while inspiring people on Earth with the fragility and wonder of our planet.',
    explorerFeature: 'cupola-view',
  },
  {
    id: 4,
    title: 'Auroras from Space',
    description: 'See stunning auroras from the ISS perspective and learn what causes them.',
    details:
      'Auroras ignite when charged particles from the Sun stream along Earth’s magnetic field and collide with atoms in the upper atmosphere. From the ISS, astronauts often watch these storms of light ripple beneath them like neon curtains draped over the poles. Greens, purples, and reds shimmer along the horizon, sometimes stretching thousands of kilometers across.\n\nScientists study auroras from orbit to understand how solar activity influences our planet. Observations from the station complement measurements from satellites and ground-based telescopes, offering unique vantage points on the shape and movement of these glowing ribbons.\n\nFor the crew, aurora sightings are a cherished perk of orbital life. Many describe the experience as a reminder of Earth’s delicate shield against the harsh environment of space, reinforcing the importance of monitoring our planet’s magnetic and atmospheric health.',
    explorerFeature: 'aurora',
  },
];
