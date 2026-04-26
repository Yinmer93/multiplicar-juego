import { useState, useRef } from 'react';
import './QuestionInput.css';

export default function QuestionInput({ onSubmit, disabled, label }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      onSubmit(num);
      setValue('');
      inputRef.current?.focus();
    }
  }

  return (
    <form className="question-input" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        autoFocus
        className="question-input__field"
        placeholder="?"
        min="0"
        max="999"
      />
      <button
        type="submit"
        disabled={disabled || value === ''}
        className="btn btn-primary question-input__btn"
      >
        {label}
      </button>
    </form>
  );
}
