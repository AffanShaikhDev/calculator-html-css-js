const screen = document.querySelector('#screen');
const history = document.querySelector('#history');
const keys = document.querySelector('#keys');

let currentInput = '0';
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;
let justCalculated = false;

function updateDisplay() {
  screen.textContent = currentInput;
}

function inputDigit(digit) {
  if (waitingForSecondOperand || justCalculated) {
    currentInput = digit;
    waitingForSecondOperand = false;
    justCalculated = false;
  } else {
    currentInput = currentInput === '0' ? digit : currentInput + digit;
  }
  updateDisplay();
}

function inputDecimal() {
  if (waitingForSecondOperand || justCalculated) {
    currentInput = '0.';
    waitingForSecondOperand = false;
    justCalculated = false;
  } else if (!currentInput.includes('.')) {
    currentInput += '.';
  }
  updateDisplay();
}

function calculate(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? null : a / b;
    default: return b;
  }
}

function formatResult(number) {
  if (!Number.isFinite(number)) return 'Error';
  // Avoid long floating-point tails while preserving useful precision.
  return String(Number(number.toPrecision(12)));
}

function chooseOperator(nextOperator) {
  const inputValue = Number(currentInput);

  if (operator && waitingForSecondOperand) {
    operator = nextOperator;
    history.textContent = `${firstOperand} ${operator}`;
    return;
  }

  if (firstOperand === null || justCalculated) {
    firstOperand = inputValue;
  } else if (operator) {
    const result = calculate(firstOperand, inputValue, operator);
    if (result === null) {
      showError();
      return;
    }
    currentInput = formatResult(result);
    firstOperand = result;
    updateDisplay();
  }

  waitingForSecondOperand = true;
  justCalculated = false;
  operator = nextOperator;
  history.textContent = `${currentInput} ${operator}`;
}

function showError() {
  currentInput = 'Cannot divide by 0';
  firstOperand = null;
  operator = null;
  waitingForSecondOperand = true;
  justCalculated = true;
  history.textContent = '';
  updateDisplay();
}

function performCalculation() {
  if (operator === null || waitingForSecondOperand) return;

  const secondOperand = Number(currentInput);
  const expression = `${firstOperand} ${operator} ${secondOperand}`;
  const result = calculate(firstOperand, secondOperand, operator);

  if (result === null) {
    showError();
    return;
  }

  currentInput = formatResult(result);
  history.textContent = `${expression} =`;
  firstOperand = null;
  operator = null;
  waitingForSecondOperand = false;
  justCalculated = true;
  updateDisplay();
}

function clearCalculator() {
  currentInput = '0';
  firstOperand = null;
  operator = null;
  waitingForSecondOperand = false;
  justCalculated = false;
  history.textContent = '';
  updateDisplay();
}

function backspace() {
  if (waitingForSecondOperand || justCalculated || currentInput === 'Cannot divide by 0') {
    clearCalculator();
    return;
  }
  currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : '0';
  if (currentInput === '-') currentInput = '0';
  updateDisplay();
}

function applyPercent() {
  if (currentInput === 'Cannot divide by 0') return;
  currentInput = formatResult(Number(currentInput) / 100);
  updateDisplay();
}

keys.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  if (button.dataset.number !== undefined) inputDigit(button.dataset.number);
  else if (button.dataset.operator) chooseOperator(button.dataset.operator);
  else {
    switch (button.dataset.action) {
      case 'clear': clearCalculator(); break;
      case 'backspace': backspace(); break;
      case 'decimal': inputDecimal(); break;
      case 'percent': applyPercent(); break;
      case 'equals': performCalculation(); break;
    }
  }
});

document.addEventListener('keydown', (event) => {
  if (/^[0-9]$/.test(event.key)) inputDigit(event.key);
  else if (event.key === '.') inputDecimal();
  else if (event.key === '+') chooseOperator('+');
  else if (event.key === '-') chooseOperator('−');
  else if (event.key === '*') chooseOperator('×');
  else if (event.key === '/') {
    event.preventDefault();
    chooseOperator('÷');
  } else if (event.key === 'Enter' || event.key === '=') performCalculation();
  else if (event.key === 'Backspace') backspace();
  else if (event.key === 'Escape') clearCalculator();
});

updateDisplay();
