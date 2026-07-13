import OptionButton from './OptionButton.jsx';

/**
 * QuestionCard — Q2..Q5 of the Séance.
 *
 * Renders the cryptic question and a column of 3-4 OptionButtons.
 * The parent supplies the `pool` ('narrowing' | 'darker') so the hook
 * can attribute the tap correctly.
 */
export default function QuestionCard({ question, pool, onTap, disabled }) {
  return (
    <div className="flex flex-col gap-4" data-pool={pool}>
      <h2 className="font-['Cinzel_Decorative'] text-[1.1rem] font-bold text-text-primary tracking-wide text-center">
        {question.question}
      </h2>
      {question.clarification && (
        <p className="text-text-muted text-[0.82rem] text-center italic">
          {question.clarification}
        </p>
      )}
      <div className="grid gap-2" role="list">
        {question.options.map((option) => (
          <OptionButton
            key={option.id}
            option={option}
            onTap={(optionId) => onTap(question.id, optionId, pool)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
