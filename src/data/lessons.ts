export interface Lesson {
  id: number;
  title: string;
  description: string;
  details: string;
  explorerFeature: string;
  facts: string[];
  model: string;
  visual:
    | 'orbit'
    | 'dayNight'
    | 'cupola'
    | 'aurora'
    | 'life'
    | 'orbitPhysics'
    | 'international'
    | 'microgravity'
    | 'earthObservation'
    | 'communications'
    | 'docking'
    | 'future';
  funFact: string;
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
    facts: ['Speed: 27,571 km/h', '90-minute orbits', '16 sunrises every day'],
    model: '/models/lesson-orbit-speed.glb',
    visual: 'orbit',
    funFact: 'In the time it takes you to watch a movie, the ISS has circled Earth nearly twice.',
  },
  {
    id: 2,
    title: 'Why 16 Sunsets per Day?',
    description: 'Discover why astronauts see 16 sunrises and sunsets each day aboard the ISS.',
    details:
      'Because the ISS loops around Earth every 90 minutes, crew members witness daybreak and nightfall many times during a single shift. Each orbit carries the station through alternating arcs of daylight and darkness, resulting in about 16 sunrises and 16 sunsets every 24 hours. The spectacle paints the horizon with vivid colors that race across the windows in mere moments.\n\nThis rapid light cycle can challenge human circadian rhythms. Astronauts rely on carefully programmed lighting inside the station, along with strict sleep schedules, to signal to their bodies when it is time to rest. Mission planners also choreograph activities to minimize fatigue, particularly during spacewalk preparations when alertness is vital.\n\nStudying how the body adapts to these rapid transitions helps scientists design lighting systems and routines for future deep-space missions. Lessons learned from the ISS inform how crews might live on voyages to the Moon, Mars, and beyond.',
    explorerFeature: 'day-night-cycle',
    facts: ['1 orbit = 90 minutes', 'Day/night changes every 45 minutes', 'Lighting helps regulate sleep'],
    model: '/models/lesson-day-night.glb',
    visual: 'dayNight',
    funFact: 'Astronauts sometimes wear light-blocking visors at “night” so their brains know it is time to sleep.',
  },
  {
    id: 3,
    title: 'Cupola: Astronaut’s Window',
    description: 'Explore Earth from the ISS Cupola, a 360° observatory window for astronauts.',
    details:
      'The Cupola module is a seven-window observatory perched on the ISS that provides astronauts with a sweeping panorama of Earth and space. Its central round window is the largest ever flown on a spacecraft, allowing crew members to admire swirling weather systems, glowing city lights, and the thin blue line of Earth’s atmosphere.\n\nBeyond its unmatched view, the Cupola is a functional workstation. Astronauts use it to operate the Canadarm2 robotic arm, monitor visiting spacecraft, and oversee spacewalks. The surrounding equipment consoles glow with instrument readouts, framing Earth’s beauty with the practical tools of orbital operations.\n\nThe Cupola has also become an iconic venue for photography. Images captured here help scientists track natural events like hurricanes, volcanic eruptions, and glacial changes, while inspiring people on Earth with the fragility and wonder of our planet.',
    explorerFeature: 'cupola-view',
    facts: ['Seven-window observation dome', 'Built by the European Space Agency', 'Hosts the Canadarm2 controls'],
    model: '/models/lesson-cupola.glb',
    visual: 'cupola',
    funFact: 'Astronaut Tracy Caldwell Dyson once spent her off-duty time recording poetry readings from the Cupola.',
  },
  {
    id: 4,
    title: 'Auroras from Space',
    description: 'See stunning auroras from the ISS perspective and learn what causes them.',
    details:
      'Auroras ignite when charged particles from the Sun stream along Earth’s magnetic field and collide with atoms in the upper atmosphere. From the ISS, astronauts often watch these storms of light ripple beneath them like neon curtains draped over the poles. Greens, purples, and reds shimmer along the horizon, sometimes stretching thousands of kilometers across.\n\nScientists study auroras from orbit to understand how solar activity influences our planet. Observations from the station complement measurements from satellites and ground-based telescopes, offering unique vantage points on the shape and movement of these glowing ribbons.\n\nFor the crew, aurora sightings are a cherished perk of orbital life. Many describe the experience as a reminder of Earth’s delicate shield against the harsh environment of space, reinforcing the importance of monitoring our planet’s magnetic and atmospheric health.',
    explorerFeature: 'aurora',
    facts: ['Caused by solar wind particles', 'Best seen near the poles', 'Colors depend on atmospheric gases'],
    model: '/models/lesson-aurora.glb',
    visual: 'aurora',
    funFact: 'Some auroras are so bright that astronauts can read checklists by their glow.',
  },
  {
    id: 5,
    title: 'Life on the ISS',
    description: 'Discover how astronauts eat, sleep, and live in microgravity.',
    details:
      'Astronauts aboard the ISS live in microgravity, where every daily task becomes a challenge. Sleeping requires strapping themselves into sleeping bags so they do not drift around. Meals arrive dehydrated or thermostabilized, and each pouch must be carefully managed so crumbs and droplets do not float away.\n\nTo stay healthy, crew members exercise around two hours each day using treadmills, stationary bikes, and resistive machines. Without this routine, muscles and bones weaken quickly. Astronauts also schedule regular medical checks, coordinate video calls with family, and carve out time for science experiments and maintenance tasks.',
    explorerFeature: 'life-on-iss',
    facts: ['Two hours of exercise daily', 'Sleeping bags attach to walls', 'Food is carefully packaged'],
    model: '/models/lesson-life-iss.glb',
    visual: 'life',
    funFact: 'Velcro is everywhere aboard the ISS—it keeps pens, utensils, and experiments from floating away.',
  },
  {
    id: 6,
    title: 'Why the ISS Doesn’t Fall',
    description: 'Understand the physics behind the ISS staying in orbit.',
    details:
      'The ISS is constantly falling toward Earth, but its tremendous forward speed means it keeps missing the planet. This balance between gravity’s pull and orbital velocity creates continuous free fall, known as orbit. Astronauts feel weightless because they fall at the same rate as their spacecraft.\n\nControllers perform periodic reboost maneuvers to counter atmospheric drag. These small engine burns nudge the station to higher altitudes, keeping the balance between gravity and speed intact and ensuring the laboratory remains aloft.',
    explorerFeature: 'why-iss-doesnt-fall',
    facts: ['Orbit is continuous free fall', 'Reboost burns fight drag', 'Velocity balances gravity'],
    model: '/models/lesson-orbit-physics.glb',
    visual: 'orbitPhysics',
    funFact: 'Even at 400 km up, traces of atmosphere still tug on the ISS and gradually slow it down.',
  },
  {
    id: 7,
    title: 'International Crew',
    description: 'Learn about the astronauts and nations that work together on the ISS.',
    details:
      'The ISS is a symbol of global cooperation. NASA, Roscosmos, ESA, JAXA, and CSA built and operate the outpost together, coordinating everything from launch schedules to science programs. Crew members often speak multiple languages to collaborate seamlessly during spacewalks and experiments.\n\nInternational partners share responsibilities for resupply missions, power systems, and research priorities. This teamwork showcases how nations can pool resources to tackle complex challenges in space.',
    explorerFeature: 'international-crew',
    facts: ['15 nations have flown crew', 'Mission control spans continents', 'Shared science goals unite partners'],
    model: '/models/lesson-international-crew.glb',
    visual: 'international',
    funFact: 'The ISS’s official languages are English and Russian, and every astronaut learns key phrases in both.',
  },
  {
    id: 8,
    title: 'Experiments in Microgravity',
    description: 'See why the ISS is the world’s most unique science lab.',
    details:
      'The ISS enables experiments impossible on Earth. In microgravity, flames form spheres, fluids behave strangely, and biological systems reveal how gravity shapes life. Scientists study everything from crystal growth to human immune responses using the station’s specialized facilities.\n\nResults feed into medicine, materials science, and future exploration. Insights gained in orbit help design lighter alloys, more effective drugs, and life-support systems for deep-space missions.',
    explorerFeature: 'microgravity-experiments',
    facts: ['Microgravity changes fluid behavior', 'Over 3,000 experiments so far', 'Findings improve life on Earth'],
    model: '/models/lesson-microgravity.glb',
    visual: 'microgravity',
    funFact: 'Protein crystals grown on the ISS can be up to 10 times larger than those made on Earth.',
  },
  {
    id: 9,
    title: 'Earth Observation',
    description: 'Explore how astronauts and instruments monitor Earth from space.',
    details:
      'From its vantage point, the ISS offers sweeping views of our planet. Astronauts use handheld cameras to capture storms, wildfires, and coastlines in stunning detail. These images support disaster response teams, environmental researchers, and educators around the world.\n\nMounted instruments gather data on atmospheric chemistry, ocean color, and changes in vegetation. Combining human observations with sensor readings provides a richer understanding of Earth’s dynamic systems.',
    explorerFeature: 'earth-observation',
    facts: ['Crew take thousands of photos yearly', 'Instruments monitor climate trends', 'Data assists disaster response'],
    model: '/models/lesson-earth-observation.glb',
    visual: 'earthObservation',
    funFact: 'Some of the most detailed lightning studies come from cameras pointed out of the ISS windows.',
  },
  {
    id: 10,
    title: 'Communications with Earth',
    description: 'How the ISS stays connected with mission control and families.',
    details:
      'The ISS relies on a network of Tracking and Data Relay Satellites (TDRS) to transmit voice, video, and science data. These satellites route signals between the station and ground antennas, ensuring controllers can monitor systems in real time.\n\nAstronauts also benefit from internet-linked services for email, video calls, and live broadcasts. Delays are minimal thanks to the satellite network, keeping the crew connected to loved ones and classrooms.',
    explorerFeature: 'communications',
    facts: ['TDRS network keeps contact continuous', 'Voice, video, and telemetry stream constantly', 'Crew can video chat with family'],
    model: '/models/lesson-communications.glb',
    visual: 'communications',
    funFact: 'Astronauts occasionally join live TV interviews from orbit using the same communications network.',
  },
  {
    id: 11,
    title: 'Docking and Visiting Vehicles',
    description: 'Learn how spacecraft like Dragon and Soyuz dock with the ISS.',
    details:
      'The ISS receives cargo and crew from visiting spacecraft such as SpaceX Dragon, Boeing Starliner, Northrop Grumman Cygnus, and Soyuz. Approaching vehicles follow precise trajectories, guided by GPS, lasers, and crew monitoring from inside the station.\n\nSome spacecraft dock autonomously, while others require manual control using joysticks and cameras. Every arrival brings fresh supplies, experiments, and sometimes new modules.',
    explorerFeature: 'docking',
    facts: ['Multiple spacecraft visit yearly', 'Autonomous and manual dockings occur', 'Cargo delivers experiments and fuel'],
    model: '/models/lesson-docking.glb',
    visual: 'docking',
    funFact: 'The Canadarm2 robotic arm can capture spacecraft that do not dock on their own, like Northrop Grumman’s Cygnus.',
  },
  {
    id: 12,
    title: 'Future of the ISS',
    description: 'Discover what’s next for the station and space habitats.',
    details:
      'The ISS has been in operation since 1998, but its mission is evolving. NASA and its partners plan to transition research to commercial space stations later in the decade, freeing resources for deep-space exploration. Companies are already designing free-flying laboratories and commercial modules.\n\nLessons from the ISS inform the Lunar Gateway, a planned outpost around the Moon that will support Artemis missions. The experience gained in long-duration spaceflight will also prepare crews for eventual voyages to Mars.',
    explorerFeature: 'future-of-iss',
    facts: ['Commercial stations are in development', 'Lunar Gateway builds on ISS lessons', 'ISS operations extend through 2030'],
    model: '/models/lesson-future-iss.glb',
    visual: 'future',
    funFact: 'Some ISS modules may be detached and reused as part of commercial stations after retirement.',
  },
];
