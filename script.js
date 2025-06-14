// EZDAROO minimal interactions

window.addEventListener('DOMContentLoaded', () => {
  const doseBtn = document.getElementById('dose-btn');
  const doseForm = document.getElementById('dose-form');
  const weightInput = document.getElementById('weight');
  const calcBtn = document.getElementById('calc-dose');
  const result = document.getElementById('dose-result');

  doseBtn.addEventListener('click', () => {
    doseForm.classList.toggle('hidden');
  });

  calcBtn.addEventListener('click', () => {
    const weight = parseFloat(weightInput.value);
    if (weight > 0) {
      const dose = Math.round(weight * 15);
      result.textContent = `دوز پیشنهادی استامینوفن: ${dose} mg`;
    } else {
      result.textContent = 'لطفاً وزن معتبر وارد کنید';
    }
  });
});
