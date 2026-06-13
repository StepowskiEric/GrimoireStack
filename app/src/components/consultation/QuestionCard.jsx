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
    <div className="seance-question" data-pool={pool}>
      <h2 className="seance-question__text">{question.question}</h2>
      <div className="seance-question__options" role="list">
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
