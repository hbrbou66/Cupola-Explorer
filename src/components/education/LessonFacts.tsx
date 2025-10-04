import type { Lesson } from '../../data/lessons.ts';

interface LessonFactsProps {
  facts: Lesson['facts'];
}

const LessonFacts = ({ facts }: LessonFactsProps) => {
  if (!facts.length) {
    return null;
  }

  return (
    <div className="lesson-facts space-y-3">
      <h3 className="text-sky-300/90 text-sm tracking-widest uppercase">Key Facts</h3>
      <ul className="grid gap-3 md:grid-cols-1">
        {facts.map((fact) => (
          <li
            key={fact}
            className="rounded-2xl border border-sky-800/50 bg-slate-900/40 px-4 py-3 text-sm text-sky-100/90"
          >
            {fact}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LessonFacts;
