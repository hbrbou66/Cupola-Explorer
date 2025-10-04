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
  {
    id: 5,
    title: 'Life on the ISS',
    description: 'Discover how astronauts eat, sleep, and live in microgravity.',
    details:
      'Astronauts aboard the ISS live in microgravity, where every daily task becomes a challenge. Sleeping requires sleeping bags strapped to walls, food must be eaten from sealed pouches, and exercise is critical to avoid muscle loss. This lesson explores daily life in orbit.',
    explorerFeature: 'life-on-iss',
  },
  {
    id: 6,
    title: 'Why the ISS Doesn’t Fall',
    description: 'Understand the physics behind the ISS staying in orbit.',
    details:
      'The ISS is constantly falling toward Earth, but because it moves forward so fast, it keeps missing the planet. This is called free fall or orbit. Gravity and velocity balance each other, keeping the ISS in stable orbit.',
    explorerFeature: 'why-iss-doesnt-fall',
  },
  {
    id: 7,
    title: 'International Crew',
    description: 'Learn about the astronauts and nations that work together on the ISS.',
    details:
      'The ISS is a symbol of global cooperation, with contributions from NASA (USA), Roscosmos (Russia), ESA (Europe), JAXA (Japan), and CSA (Canada). Astronauts from many nations rotate aboard, working together in science, engineering, and exploration.',
    explorerFeature: 'international-crew',
  },
  {
    id: 8,
    title: 'Experiments in Microgravity',
    description: 'See why the ISS is the world’s most unique science lab.',
    details:
      'The ISS is used to study how microgravity affects biology, physics, medicine, and materials. Experiments range from protein crystallization to fluid dynamics, offering insights impossible to achieve on Earth.',
    explorerFeature: 'microgravity-experiments',
  },
  {
    id: 9,
    title: 'Earth Observation',
    description: 'Explore how astronauts and instruments monitor Earth from space.',
    details:
      'From its vantage point, the ISS provides an unparalleled view of Earth. Astronauts capture breathtaking images, while instruments track storms, wildfires, deforestation, and climate change.',
    explorerFeature: 'earth-observation',
  },
  {
    id: 10,
    title: 'Communications with Earth',
    description: 'How the ISS stays connected with mission control and families.',
    details:
      'The ISS relies on satellites like NASA’s Tracking and Data Relay Satellites (TDRS) to stay in constant contact with Earth. Data, voice, and video are transmitted to mission control, while astronauts also have access to email and video calls with families.',
    explorerFeature: 'communications',
  },
  {
    id: 11,
    title: 'Docking and Visiting Vehicles',
    description: 'Learn how spacecraft like Dragon and Soyuz dock with the ISS.',
    details:
      'The ISS receives cargo and crew from visiting spacecraft such as SpaceX Dragon, Northrop Grumman Cygnus, and Soyuz. Docking can be automatic or manually controlled, requiring extreme precision as spacecraft travel thousands of km/h.',
    explorerFeature: 'docking',
  },
  {
    id: 12,
    title: 'Future of the ISS',
    description: 'Discover what’s next for the station and space habitats.',
    details:
      'The ISS has been in operation since 1998, but its mission will eventually transition to commercial space stations and deep space exploration. New concepts include private modules, lunar Gateway, and Mars preparation.',
    explorerFeature: 'future-of-iss',
  },
];
