import React, { useState } from 'react';
import { QUESTION_PACKS } from './data/questions';
import { TIERS } from './data/tiers';
import { evaluateAnswer } from './utils/matcher';

export default function App() {
  const [gameState, setGameState] = useState('MENU');
  const [selectedPackId, setSelectedPackId] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Історія відповідей: [{ question, userInput, result: { tier, matchedAs } }]
  const [history, setHistory] = useState([]);
  const [showAnswersForIndex, setShowAnswersForIndex] = useState(null);

  const activePack = QUESTION_PACKS.find((p) => p.id === selectedPackId) || QUESTION_PACKS[0];
  const currentQuestion = activePack.questions[currentIndex];

  const startGame = (packId) => {
    setSelectedPackId(packId);
    setCurrentIndex(0);
    setHistory([]);
    setInputValue('');
    setErrorMessage('');
    setShowAnswersForIndex(null);
    setGameState('PLAYING');
  };

  const handleSubmitAnswer = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const evaluation = evaluateAnswer(trimmed, currentQuestion);

    // Якщо слова немає в базі — даємо ще спробу
    if (evaluation.tier.id === 'miss') {
      setErrorMessage(`Слово "${trimmed}" не знайдено в базі відповідей. Спробуйте інший варіант!`);
      return;
    }

    setErrorMessage('');
    const record = {
      question: currentQuestion,
      userInput: trimmed,
      result: evaluation
    };

    const nextHistory = [...history, record];
    setHistory(nextHistory);
    setInputValue('');

    if (currentIndex + 1 < activePack.questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setGameState('SUMMARY');
    }
  };

  const handleSkipQuestion = () => {
    setErrorMessage('');
    const record = {
      question: currentQuestion,
      userInput: '— Пропущено —',
      result: { tier: TIERS.MISS, matchedAs: null }
    };

    const nextHistory = [...history, record];
    setHistory(nextHistory);
    setInputValue('');

    if (currentIndex + 1 < activePack.questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setGameState('SUMMARY');
    }
  };

  const totalScore = history.reduce((sum, item) => sum + item.result.tier.points, 0);

  return (
    <div className="container">
      <header className="header">
        <h1>КРІЛЬЙОН (Krillion UA)</h1>
        <p className="subtitle">
          Дайте <strong>найрідкіснішу</strong> правильну відповідь на кожне з 7 запитань!
        </p>
      </header>

      {/* 1. ГОЛОВНЕ МЕНЮ */}
      {gameState === 'MENU' && (
        <div className="card">
          <h2>Оберіть набір запитань:</h2>
          <div className="pack-list">
            {QUESTION_PACKS.map((pack) => (
              <div key={pack.id} className="pack-item">
                <div>
                  <strong>{pack.title}</strong>
                  <div className="pack-details">7 питань у раунді</div>
                </div>
                <button className="btn-primary" onClick={() => startGame(pack.id)}>
                  Грати
                </button>
              </div>
            ))}
          </div>

          <div className="tier-legend">
            <h3>Шкала рідкісності:</h3>
            <ul>
              {Object.values(TIERS)
                .filter((t) => t.id !== 'miss')
                .map((t) => (
                  <li key={t.id}>
                    <span className={`badge ${t.badgeClass}`}>{t.name}</span>
                    <span>+{t.points} балів</span>
                    <small>({t.description})</small>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}

      {/* 2. ІГРОВИЙ ПРОЦЕС */}
      {gameState === 'PLAYING' && (
        <div className="card">
          <div className="progress-bar">
            <span>
              Питання {currentIndex + 1} з {activePack.questions.length}
            </span>
            <span>Рахунок: <strong>{totalScore}</strong></span>
          </div>

          <div className="question-box">
            <h2>{currentQuestion.prompt}</h2>
          </div>

          <form onSubmit={handleSubmitAnswer} className="answer-form">
            <input
              type="text"
              autoFocus
              className="text-input"
              placeholder="Введіть рідкісну відповідь..."
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
            />

            {errorMessage && (
              <div className="error-message">
                {errorMessage}
              </div>
            )}

            <div className="btn-group">
              <button type="submit" className="btn-primary" disabled={!inputValue.trim()}>
                Відповісти
              </button>
              <button type="button" className="btn-secondary" onClick={handleSkipQuestion}>
                Пропустити (0 б.)
              </button>
            </div>
          </form>

          {/* Результати попередніх запитань забігу */}
          {history.length > 0 && (
            <div className="history-preview">
              <h3>Попередні відповіді:</h3>
              <div className="history-list">
                {history.map((item, idx) => (
                  <div key={idx} className="history-item">
                    <span>
                      #{idx + 1} <strong>{item.question.prompt}:</strong> {item.userInput}
                    </span>
                    <span className={`badge ${item.result.tier.badgeClass}`}>
                      {item.result.tier.name} (+{item.result.tier.points})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. РЕЗУЛЬТАТИ */}
      {gameState === 'SUMMARY' && (
        <div className="card">
          <h2>Раунд завершено!</h2>
          <div className="final-score">
            Загальний результат: <span>{totalScore}</span> балів
          </div>

          <h3>Деталізація по питаннях:</h3>
          <div className="history-list">
            {history.map((item, idx) => (
              <div key={idx} className="summary-item">
                <div className="summary-item-header">
                  <strong>{idx + 1}. {item.question.prompt}</strong>
                  <span className={`badge ${item.result.tier.badgeClass}`}>
                    {item.result.tier.name} (+{item.result.tier.points})
                  </span>
                </div>
                <div>Ваша відповідь: <em>"{item.userInput}"</em></div>
                {item.result.matchedAs && (
                  <div className="matched-note">
                    Розпізнано як: <strong>{item.result.matchedAs}</strong>
                  </div>
                )}

                <button
                  type="button"
                  className="btn-toggle-answers"
                  onClick={() =>
                    setShowAnswersForIndex(showAnswersForIndex === idx ? null : idx)
                  }
                >
                  {showAnswersForIndex === idx ? '▲ Приховати базу відповідей' : '▼ Переглянути базу відповідей'}
                </button>

                {showAnswersForIndex === idx && (
                  <div className="answers-breakdown">
                    <p><strong>Один на крільйон (1000 б.):</strong> {item.question.tiers.one_in_krillion.join(', ')}</p>
                    <p><strong>Глибинна знахідка (400 б.):</strong> {item.question.tiers.deep_cut.join(', ')}</p>
                    <p><strong>Рідкісна (200 б.):</strong> {item.question.tiers.rare.join(', ')}</p>
                    <p><strong>Косякова риба (75 б.):</strong> {item.question.tiers.schooler.join(', ')}</p>
                    <p><strong>Планктон (20 б.):</strong> {item.question.tiers.plankton.join(', ')}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="menu-btn-container">
            <button className="btn-primary" onClick={() => setGameState('MENU')}>
              Повернутися в меню
            </button>
            <button className="btn-secondary" onClick={() => startGame(selectedPackId)}>
              Спробувати цей набір ще раз
            </button>
          </div>
        </div>
      )}
    </div>
  );
}