import React, { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { nb } from '../../lib/typo';

export interface FaqEntry {
  question: string;
  answer: React.ReactNode;
}

interface FaqListProps {
  items: FaqEntry[];
  /** Niveau du titre de chaque question (h2 sur la page FAQ, h3 ailleurs). */
  headingLevel?: 2 | 3;
  tone?: 'paper' | 'field';
}

/** Accordéon accessible : boutons natifs (clavier), aria-expanded / aria-controls. */
export const FaqList: React.FC<FaqListProps> = ({ items, headingLevel = 3, tone = 'paper' }) => {
  const [open, setOpen] = useState<number | null>(null);
  const baseId = useId();
  const Heading = (headingLevel === 2 ? 'h2' : 'h3') as 'h2' | 'h3';
  const itemBg = tone === 'paper' ? 'bg-field' : 'bg-white';

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isOpen = open === i;
        const btnId = `${baseId}-q${i}`;
        const panelId = `${baseId}-a${i}`;
        return (
          <div key={item.question} className={`rounded-3xl ${itemBg}`}>
            <Heading className="m-0">
              <button
                type="button"
                id={btnId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 rounded-3xl px-5 py-4 text-left text-lg font-bold leading-snug sm:px-7"
              >
                <span>{nb(item.question)}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </Heading>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              hidden={!isOpen}
              className="px-5 pb-6 text-body text-ink sm:px-7"
            >
              <div className="max-w-[65ch]">{item.answer}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
