export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonQuiz {
  lessonId: number;
  questions: QuizQuestion[];
}

export const quizzes: LessonQuiz[] = [
  {
    lessonId: 1,
    questions: [
      {
        question: 'How fast does the ISS travel to maintain its orbit?',
        options: ['7,200 km/h', '27,571 km/h', '120,000 km/h', '9,800 km/h'],
        correctIndex: 1,
        explanation:
          'The station cruises at roughly 27,571 km/h, fast enough to circle Earth in about 90 minutes.',
      },
      {
        question: 'Roughly how often does the ISS complete a lap around Earth?',
        options: ['Every 45 minutes', 'Every 90 minutes', 'Every 3 hours', 'Twice per day'],
        correctIndex: 1,
        explanation: 'One full orbit takes about 90 minutes, delivering sunrise or sunset about every 45 minutes.',
      },
      {
        question: 'Why do controllers schedule periodic “reboost” maneuvers?',
        options: [
          'To steer away from storms',
          'To counter the pull of the Moon',
          'To counter thin atmospheric drag',
          'To conserve propellant',
        ],
        correctIndex: 2,
        explanation:
          'Even at 400 km up, wisps of atmosphere slow the ISS; reboost burns nudge it back to a safe altitude.',
      },
    ],
  },
  {
    lessonId: 2,
    questions: [
      {
        question: 'Why do astronauts witness about 16 sunrises and sunsets per Earth day?',
        options: [
          'The ISS rotates slowly in place',
          'The station completes ~16 orbits daily',
          'Earth spins faster at the equator',
          'Mission control dims the station lights',
        ],
        correctIndex: 1,
        explanation:
          'Each 90-minute orbit carries the station into daylight and darkness, adding up to ~16 transitions every day.',
      },
      {
        question: 'How do crews keep their body clocks aligned amid rapid light changes?',
        options: [
          'By taking sleeping pills regularly',
          'By turning off all station lights',
          'With carefully programmed lighting and schedules',
          'By sleeping only during daytime passes',
        ],
        correctIndex: 2,
        explanation:
          'Engineers choreograph lighting cues and sleep schedules so circadian rhythms stay on track.',
      },
      {
        question: 'What challenge do frequent sunrises pose for spacewalk preparation?',
        options: [
          'It interferes with suit communications',
          'Crews risk losing tools in the dark',
          'Maintaining alertness becomes harder',
          'Spacesuits drain power faster',
        ],
        correctIndex: 2,
        explanation: 'Fatigue can build quickly, so planners align tasks to keep astronauts alert for critical work.',
      },
    ],
  },
  {
    lessonId: 3,
    questions: [
      {
        question: 'What makes the Cupola module unique on the ISS?',
        options: [
          'It houses the main airlock',
          'It offers a seven-window panoramic observatory',
          'It stores emergency water supplies',
          'It is the only sleeping quarters',
        ],
        correctIndex: 1,
        explanation:
          'The Cupola’s seven windows, including the largest flown on a spacecraft, give astronauts sweeping views.',
      },
      {
        question: 'Which tool is commonly operated from the Cupola?',
        options: ['The Canadarm2 robotic arm', 'The Soyuz escape capsule', 'The primary telescope', 'The oxygen recycler'],
        correctIndex: 0,
        explanation:
          'Astronauts control Canadarm2 from the Cupola, using its views to maneuver visiting spacecraft.',
      },
      {
        question: 'Why are Cupola photos valuable for Earth scientists?',
        options: [
          'They provide uninterrupted video streams',
          'They track natural events like storms and volcanoes',
          'They are used to calibrate telescopes',
          'They map the Moon’s surface',
        ],
        correctIndex: 1,
        explanation:
          'Astronaut imagery documents hurricanes, wildfires, and other events that help researchers on the ground.',
      },
    ],
  },
  {
    lessonId: 4,
    questions: [
      {
        question: 'What triggers auroras visible from the ISS?',
        options: [
          'Lightning in Earth’s lower atmosphere',
          'Charged solar particles colliding with atmospheric atoms',
          'Reflections from city lights',
          'Volcanic ash glowing at night',
        ],
        correctIndex: 1,
        explanation:
          'Solar wind particles funnel along magnetic field lines and excite atmospheric gases, producing auroras.',
      },
      {
        question: 'Why do auroras appear brightest near the poles?',
        options: [
          'Earth’s rotation drags clouds northward',
          'Magnetic field lines converge there',
          'There is less ozone overhead',
          'The ISS flies lower at the poles',
        ],
        correctIndex: 1,
        explanation:
          'The planet’s magnetic field channels particles toward the poles, concentrating the light shows.',
      },
      {
        question: 'How do aurora observations from orbit help scientists?',
        options: [
          'They allow pilots to avoid turbulence',
          'They reveal the temperature of the ocean',
          'They show how solar activity affects Earth’s atmosphere',
          'They predict meteor showers',
        ],
        correctIndex: 2,
        explanation:
          'Aurora studies improve understanding of how space weather interacts with the atmosphere and magnetosphere.',
      },
    ],
  },
  {
    lessonId: 5,
    questions: [
      {
        question: 'Why do astronauts strap themselves into sleeping bags?',
        options: [
          'To keep their bodies warm',
          'To keep from drifting around the station',
          'To block engine noise',
          'To simulate gravity',
        ],
        correctIndex: 1,
        explanation:
          'In microgravity they would float freely, so sleeping bags are anchored to walls or ceilings.',
      },
      {
        question: 'How much daily exercise do crews aim for on the ISS?',
        options: ['About 30 minutes', 'One hour', 'Roughly two hours', 'Four hours'],
        correctIndex: 2,
        explanation:
          'Astronauts log around two hours of exercise to protect muscles and bones in weightlessness.',
      },
      {
        question: 'Why is food packaging carefully managed in orbit?',
        options: [
          'To maximize flavor',
          'To prevent crumbs and droplets from floating away',
          'To reduce weight for re-entry',
          'To grow plants aboard the station',
        ],
        correctIndex: 1,
        explanation:
          'Loose crumbs or liquids can damage equipment, so meals are contained and eaten with special utensils.',
      },
    ],
  },
  {
    lessonId: 6,
    questions: [
      {
        question: 'Why do astronauts feel weightless aboard the ISS?',
        options: [
          'Gravity is weaker in orbit',
          'The station spins to cancel gravity',
          'They free-fall around Earth at the same rate as the station',
          'There is no gravity above the atmosphere',
        ],
        correctIndex: 2,
        explanation:
          'The ISS and crew are in continuous free fall, so they float together despite Earth’s gravity still acting.',
      },
      {
        question: 'What balances the pull of gravity to keep the ISS in orbit?',
        options: ['Solar radiation pressure', 'Its forward orbital speed', 'Magnetic forces', 'Thrusters firing constantly'],
        correctIndex: 1,
        explanation:
          'The station’s tremendous velocity keeps it moving forward fast enough to “miss” Earth as it falls.',
      },
      {
        question: 'Why are reboost burns necessary for orbital maintenance?',
        options: [
          'To realign the station with the Moon',
          'To counteract atmospheric drag that slowly lowers its orbit',
          'To keep solar panels pointed at the Sun',
          'To test spacecraft thrusters',
        ],
        correctIndex: 1,
        explanation:
          'Even the thin atmosphere at 400 km tugs on the ISS, so occasional burns restore its altitude.',
      },
    ],
  },
  {
    lessonId: 7,
    questions: [
      {
        question: 'Which agencies jointly operate the ISS?',
        options: [
          'Only NASA and ESA',
          'NASA, Roscosmos, ESA, JAXA, and CSA',
          'NASA and private companies',
          'Roscosmos and CNSA',
        ],
        correctIndex: 1,
        explanation:
          'Five core agencies—NASA, Roscosmos, ESA, JAXA, and CSA—share responsibility for the station.',
      },
      {
        question: 'Why do astronauts often learn multiple languages before flying?',
        options: [
          'To translate Earth science data',
          'To communicate smoothly with international crewmates',
          'To broadcast to audiences worldwide',
          'To operate the station’s computers',
        ],
        correctIndex: 1,
        explanation:
          'Shared missions require quick coordination, so crews speak English and Russian plus other partner languages.',
      },
      {
        question: 'What does international cooperation on the ISS demonstrate?',
        options: [
          'Spaceflight is only achievable by a single nation',
          'Global teams can solve complex challenges together',
          'Scientific work requires minimal planning',
          'Private companies own the station',
        ],
        correctIndex: 1,
        explanation:
          'The ISS shows how nations combine resources and expertise to achieve ambitious goals in space.',
      },
    ],
  },
  {
    lessonId: 8,
    questions: [
      {
        question: 'Why is microgravity valuable for scientific experiments?',
        options: [
          'It removes the need for electricity',
          'It allows phenomena to behave differently than on Earth',
          'It provides infinite lab space',
          'It eliminates radiation exposure',
        ],
        correctIndex: 1,
        explanation:
          'Without gravity-driven convection and settling, researchers observe fluid, flame, and biological behavior in new ways.',
      },
      {
        question: 'Which areas of research benefit from ISS experiments?',
        options: [
          'Only astronomy',
          'Only robotics',
          'Medicine, materials science, and more',
          'Only geology',
        ],
        correctIndex: 2,
        explanation:
          'Findings from orbit support medicine, materials, fundamental physics, and future exploration hardware.',
      },
      {
        question: 'How do results from ISS science help future missions?',
        options: [
          'They prove humans cannot live in space',
          'They inform designs for deep-space habitats',
          'They replace the need for ground laboratories',
          'They are kept secret for decades',
        ],
        correctIndex: 1,
        explanation:
          'Understanding how systems behave in orbit guides life-support and technology for Moon and Mars expeditions.',
      },
    ],
  },
  {
    lessonId: 9,
    questions: [
      {
        question: 'What do astronauts photograph from the ISS to support people on Earth?',
        options: [
          'Only artistic selfies',
          'Storms, wildfires, and coastlines',
          'Distant galaxies',
          'The surface of the Moon',
        ],
        correctIndex: 1,
        explanation:
          'Handheld imagery documents weather events, disasters, and landscapes that aid researchers and responders.',
      },
      {
        question: 'How do mounted instruments complement astronaut photography?',
        options: [
          'They record atmospheric chemistry and other data continuously',
          'They entertain crews with movies',
          'They control spacecraft docking',
          'They are used only for art projects',
        ],
        correctIndex: 0,
        explanation:
          'Sensors monitor oceans, vegetation, and atmosphere, adding scientific depth to visual observations.',
      },
      {
        question: 'Why is the ISS a valuable platform for Earth observation?',
        options: [
          'It never enters darkness',
          'It carries the largest telescope ever built',
          'Its orbit provides repeated, wide-angle views of our planet',
          'It flies closer to the Sun than other satellites',
        ],
        correctIndex: 2,
        explanation:
          'The low Earth orbit and crew presence enable frequent, detailed looks at changing Earth systems.',
      },
    ],
  },
  {
    lessonId: 10,
    questions: [
      {
        question: 'Which network keeps the ISS in contact with Earth?',
        options: [
          'Cell towers',
          'Tracking and Data Relay Satellites (TDRS)',
          'Weather balloons',
          'Only direct ground antennas in Russia',
        ],
        correctIndex: 1,
        explanation:
          'NASA’s TDRS constellation routes voice, video, and telemetry between the station and controllers.',
      },
      {
        question: 'How do astronauts stay connected with family and classrooms?',
        options: [
          'They rely solely on letters',
          'They have no personal communication',
          'They use internet-linked voice and video services',
          'They wait to land to communicate',
        ],
        correctIndex: 2,
        explanation:
          'The relay network supports live video calls, emails, and other services so crews can stay in touch.',
      },
      {
        question: 'Why is near real-time communication important for the ISS?',
        options: [
          'It allows streaming entertainment only',
          'It ensures controllers can monitor systems and assist quickly',
          'It helps adjust the station’s orbit automatically',
          'It keeps the station visible at night',
        ],
        correctIndex: 1,
        explanation:
          'Constant contact lets mission control manage systems, support experiments, and respond to issues immediately.',
      },
    ],
  },
  {
    lessonId: 11,
    questions: [
      {
        question: 'Which visiting spacecraft can deliver crew or cargo to the ISS?',
        options: [
          'Only Space Shuttle',
          'SpaceX Dragon, Boeing Starliner, Cygnus, and Soyuz',
          'Only uncrewed resupply ships',
          'Only European vehicles',
        ],
        correctIndex: 1,
        explanation:
          'Multiple vehicles—Dragon, Starliner, Cygnus, and Soyuz—transport crew and supplies today.',
      },
      {
        question: 'How do some spacecraft dock with the ISS?',
        options: [
          'They are captured by ground-based cranes',
          'They dock autonomously or under manual joystick control',
          'Astronauts push them into place during spacewalks',
          'They attach using magnetic tethers',
        ],
        correctIndex: 1,
        explanation:
          'Arrivals may dock automatically or with crew guiding them via joysticks and cameras.',
      },
      {
        question: 'Why is each arrival significant for the crew?',
        options: [
          'It signals the station will be abandoned',
          'It brings fresh supplies, experiments, or new modules',
          'It only delivers souvenirs',
          'It means the ISS changes orbit dramatically',
        ],
        correctIndex: 1,
        explanation:
          'Visiting vehicles restock food, gear, and experiments and sometimes deliver new hardware.',
      },
    ],
  },
  {
    lessonId: 12,
    questions: [
      {
        question: 'What is one future path for ISS research operations?',
        options: [
          'Ending all space research',
          'Transitioning work to commercial space stations',
          'Moving the ISS to lunar orbit',
          'Selling the ISS to private tourists',
        ],
        correctIndex: 1,
        explanation:
          'Partners plan to shift research to commercial platforms while focusing government efforts on deep-space missions.',
      },
      {
        question: 'How does the ISS influence plans for the Lunar Gateway?',
        options: [
          'Gateway will be identical to the ISS',
          'ISS experience informs Gateway operations and design',
          'Gateway replaces the ISS immediately',
          'They are unrelated projects',
        ],
        correctIndex: 1,
        explanation:
          'Decades of ISS lessons guide how the Lunar Gateway will support Artemis missions around the Moon.',
      },
      {
        question: 'What might happen to some ISS modules after retirement?',
        options: [
          'They will be sunk in the ocean immediately',
          'They may be repurposed for commercial stations',
          'They will be stored in museums on the Moon',
          'They will power satellites in deep space',
        ],
        correctIndex: 1,
        explanation:
          'Plans include reusing certain modules as parts of future commercial orbital platforms.',
      },
    ],
  },
];

export const getQuizByLessonId = (lessonId: number) => quizzes.find((quiz) => quiz.lessonId === lessonId);
