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
        question: 'How fast does the International Space Station orbit Earth?',
        options: ['7,000 km/h', '27,571 km/h', '40,000 km/h', '15,000 km/h'],
        correctIndex: 1,
        explanation:
          'The ISS travels around Earth at about 27,571 km/h — roughly 7.66 kilometers per second.',
      },
      {
        question: 'How long does it take the ISS to complete one orbit?',
        options: ['24 hours', '90 minutes', '3 hours', '45 minutes'],
        correctIndex: 1,
        explanation:
          'The ISS completes one orbit roughly every 90 minutes — circling Earth 16 times a day.',
      },
      {
        question: 'Why doesn’t the ISS fall to Earth despite gravity?',
        options: [
          'It’s above gravity’s reach',
          'It’s moving fast enough to keep missing Earth',
          'It has rocket boosters always on',
          'Earth’s atmosphere pushes it up',
        ],
        correctIndex: 1,
        explanation:
          'The ISS is in continuous free-fall — its speed keeps it in orbit while gravity pulls it toward Earth.',
      },
    ],
  },
  {
    lessonId: 2,
    questions: [
      {
        question: 'Why do astronauts on the ISS see 16 sunrises and sunsets every day?',
        options: [
          'Because the ISS rotates faster than Earth',
          'Because the ISS orbits Earth every 90 minutes',
          'Because the Sun rotates around the ISS',
          'Because Earth spins faster in space',
        ],
        correctIndex: 1,
        explanation:
          'The ISS completes 16 orbits every 24 hours — giving astronauts 16 day/night cycles.',
      },
      {
        question: 'How does this affect astronauts’ sleep cycles?',
        options: [
          'They can’t sleep at all',
          'They use scheduled lighting to simulate day and night',
          'They only sleep during sunlight periods',
          'They stay awake for each orbit',
        ],
        correctIndex: 1,
        explanation:
          'Astronauts use artificial lighting and strict schedules to maintain circadian rhythm despite rapid day/night transitions.',
      },
      {
        question: 'How long is each full orbit of the ISS?',
        options: ['24 hours', '12 hours', '90 minutes', '45 minutes'],
        correctIndex: 2,
        explanation: 'It takes about 90 minutes for the ISS to circle the entire planet once.',
      },
    ],
  },
  {
    lessonId: 3,
    questions: [
      {
        question: 'What is the main purpose of the Cupola module?',
        options: [
          'Astronaut relaxation only',
          'Observing Earth and controlling robotic arms',
          'Solar energy generation',
          'Launching small satellites',
        ],
        correctIndex: 1,
        explanation:
          'The Cupola is a 7-window observatory used for monitoring space operations and viewing Earth.',
      },
      {
        question: 'What makes the Cupola special to astronauts?',
        options: [
          'It’s the largest window in space',
          'It provides the only sleeping area',
          'It’s used for docking spacecraft',
          'It powers the station',
        ],
        correctIndex: 0,
        explanation:
          'The Cupola’s panoramic windows provide astronauts with the most breathtaking view of Earth from orbit.',
      },
      {
        question: 'Which material protects the Cupola windows from micrometeoroids?',
        options: ['Carbon fiber', 'Transparent aluminum', 'Fused silica and borosilicate glass', 'Polycarbonate'],
        correctIndex: 2,
        explanation:
          'The Cupola’s windows are made from multiple layers of fused silica and borosilicate glass for strength and clarity.',
      },
    ],
  },
  {
    lessonId: 4,
    questions: [
      {
        question: 'What causes auroras seen from the ISS?',
        options: [
          'Reflected sunlight from clouds',
          'Charged particles from the Sun interacting with Earth’s magnetic field',
          'Radiation from the Moon',
          'Burning atmospheric gases',
        ],
        correctIndex: 1,
        explanation:
          'Auroras form when solar particles hit Earth\'s magnetic field and excite atmospheric gases near the poles.',
      },
      {
        question: 'From space, how do auroras appear to astronauts?',
        options: [
          'Flat glowing patches',
          'Massive ribbons of light wrapping around Earth',
          'Small dots near the poles',
          'Invisible infrared bands',
        ],
        correctIndex: 1,
        explanation:
          'Auroras appear as giant ribbons or curtains of light that stretch over thousands of kilometers.',
      },
      {
        question: 'Which colors are most common in auroras?',
        options: ['Blue and yellow', 'Red and purple', 'Green and pink', 'Orange and white'],
        correctIndex: 2,
        explanation:
          'Green and pink are the most common colors, caused by oxygen and nitrogen interactions in the upper atmosphere.',
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
        question: 'What keeps the ISS from falling to Earth?',
        options: [
          'Centrifugal force from rotation',
          'Its forward velocity and gravity in balance',
          'Repulsion from Earth’s magnetic field',
          'Constant rocket thrust',
        ],
        correctIndex: 1,
        explanation:
          'The ISS is moving fast enough that gravity bends its path around Earth, keeping it in orbit.',
      },
      {
        question: 'What happens to the ISS when its orbit decays?',
        options: [
          'It speeds up automatically',
          'It slowly drifts higher',
          'It reenters the atmosphere',
          'It freezes in place',
        ],
        correctIndex: 2,
        explanation:
          'Atmospheric drag slowly lowers its orbit, and occasional “reboosts” are needed to prevent reentry.',
      },
      {
        question: 'What is the term for the ISS’s orbital free-fall condition?',
        options: ['Hypergravity', 'Antigravity', 'Microgravity', 'Zero-mass zone'],
        correctIndex: 2,
        explanation:
          'Astronauts experience microgravity because both they and the ISS are falling together around Earth.',
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
