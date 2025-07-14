import React, { useState, useEffect, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Helper pro Kč
const formatCurrency = (value) => {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// --- Logika pro složené úročení ---
const calculateCompoundInterest = (
  initialInvestment,
  monthlyContribution,
  annualReturnRate,
  years
) => {
  const data = [];
  let balance = Number(initialInvestment) || 0;
  const monthlyCont = Number(monthlyContribution) || 0;
  const annualReturn = Number(annualReturnRate) || 0;
  const totalYearsNum = Number(years) || 0;

  const monthlyReturnRate = (annualReturn / 100) / 12;

  if (totalYearsNum <= 0) {
    return [{ year: 0, balance: balance, invested: balance, interest: 0 }];
  }

  // Přidáme počáteční stav pro rok 0
  // Zde zajistíme, že initialInvestment je brán v potaz pro invested na začátku
  data.push({ year: 0, balance: balance, invested: balance, interest: 0 });

  for (let year = 1; year <= totalYearsNum; year++) {
    for (let month = 0; month < 12; month++) {
      balance += monthlyCont;
      
      const interestEarned = balance * monthlyReturnRate;
      balance += interestEarned;

      if (balance < 0) balance = 0; // Zajištění, že bilance neklesne pod nulu
    }
    // Na konci každého roku uložíme data
    // Celkem vložené peníze k tomuto roku (počáteční + všechny měsíční vklady do tohoto roku)
    const currentYearTotalInvested = initialInvestment + (monthlyContribution * year * 12);
    const currentYearInterest = balance - currentYearTotalInvested;

    data.push({ 
        year: year, 
        balance: balance, 
        invested: currentYearTotalInvested, 
        // Úrok je rozdíl mezi bilancí a vloženými penězi. Může být záporný, pokud je celková hodnota nižší než vložené peníze.
        interest: currentYearInterest
    });
  }
  return data;
};

export default function CompoundInterestCalculator() {
  const [initialInvestment, setInitialInvestment] = useState(100000);
  const [monthlyContribution, setMonthlyContribution] = useState(1000);
  const [annualReturnRate, setAnnualReturnRate] = useState(7);
  const [totalYears, setTotalYears] = useState(30);

  const compoundData = calculateCompoundInterest(
    initialInvestment,
    monthlyContribution,
    annualReturnRate,
    totalYears
  );

  const finalResult = compoundData.length > 0 ? compoundData[compoundData.length - 1] : { balance: 0, invested: 0, interest: 0 };

  const chartData = {
    labels: compoundData.map(d => d.year === 0 ? 'Dnes' : `${d.year} let`),
    datasets: [
      {
        label: 'Investovaná částka',
        data: compoundData.map(d => d.invested),
        backgroundColor: 'rgba(168, 85, 247, 1)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 1,
        stack: 'Stack 1',
      },
      {
        label: 'Obdržený úrok',
        data: compoundData.map(d => d.interest),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
        stack: 'Stack 1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: false,
        position: 'nearest',
        external: function(context) {
          const { chart, tooltip } = context;
          let tooltipEl = document.getElementById('chartjs-tooltip-simple');
          let hoverLineEl = document.getElementById('chartjs-hover-line-simple');

          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip-simple';
            tooltipEl.className = 'absolute bg-gray-100 text-gray-800 p-3 rounded-lg shadow-lg pointer-events-none transition-opacity duration-150 ease-out z-50';
            document.body.appendChild(tooltipEl);
          }
          if (!hoverLineEl) {
              hoverLineEl = document.createElement('div');
              hoverLineEl.id = 'chartjs-hover-line-simple';
              hoverLineEl.className = 'absolute w-px z-40';
              hoverLineEl.style.borderLeft = '1px dashed rgba(0, 0, 0, 0.2)';
              document.body.appendChild(hoverLineEl);
          }

          if (tooltip.opacity === 0) {
            tooltipEl.style.opacity = '0';
            hoverLineEl.style.opacity = '0';
            return;
          }

          tooltipEl.classList.remove('above', 'below', 'no-transform');
          if (tooltip.yAlign) {
            tooltipEl.classList.add(tooltip.yAlign);
          } else {
            tooltipEl.classList.add('no-transform');
          }

          if (tooltip.body) {
            const titleLines = tooltip.title || [];
            const yearLabel = titleLines.length > 0 ? titleLines[0].replace(' let', '') : '0';
            const yearIndex = yearLabel === 'Dnes' ? 0 : parseInt(yearLabel);
            const yearData = compoundData[yearIndex] || compoundData[0]; 

            let innerHtml = '<div>';
            innerHtml += `<div class="font-bold text-sm mb-1">Rok: ${yearData.year}</div>`;
            innerHtml += `<div class="font-bold text-sm mb-1">Celkem: ${formatCurrency(yearData.balance)}</div>`;
            innerHtml += '</div><div class="space-y-1 mt-2">';

            tooltip.dataPoints.forEach(function(dataPoint) {
              const label = dataPoint.dataset.label;
              const value = formatCurrency(dataPoint.raw);
              const colors = dataPoint.dataset.backgroundColor; 
              
              let style = `background:${colors}; border-color:${dataPoint.dataset.borderColor}; border-width: 2px; width: 10px; height: 10px; display: inline-block; margin-right: 8px; border-radius: 50%;`;
              innerHtml += `<div class="flex items-center text-sm"><span style="${style}"></span>${label}: ${value}</div>`;
            });
            innerHtml += '</div>';

            tooltipEl.innerHTML = innerHtml;
          }

          const canvasRect = chart.canvas.getBoundingClientRect();
          const scrollX = window.scrollX || window.pageXOffset;
          const scrollY = window.scrollY || window.pageYOffset;

          const absoluteChartLeft = canvasRect.left + scrollX;
          const absoluteChartTop = canvasRect.top + scrollY;

          tooltipEl.style.opacity = '1';
          tooltipEl.style.left = absoluteChartLeft + tooltip.caretX + 'px';
          tooltipEl.style.top = absoluteChartTop + tooltip.caretY + 'px';
          tooltipEl.style.fontFamily = tooltip.options.bodyFont.family;
          tooltipEl.style.fontSize = tooltip.options.bodyFont.size + 'px';
          tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';

          if (tooltip.dataPoints && tooltip.dataPoints.length > 0) {
            const firstPoint = tooltip.dataPoints[0];
            hoverLineEl.style.opacity = '1';
            hoverLineEl.style.left = absoluteChartLeft + firstPoint.element.x + 'px';
            hoverLineEl.style.top = absoluteChartTop + firstPoint.chart.chartArea.top + 'px';
            hoverLineEl.style.height = (firstPoint.chart.chartArea.bottom - firstPoint.chart.chartArea.top) + 'px';
          } else {
            hoverLineEl.style.opacity = '0';
          }
        }
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          borderColor: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: 'black',
        },
      },
      y: {
        stacked: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          borderColor: 'rgba(0, 0, 0, 0.1)',
          borderDash: [2, 2],
        },
        ticks: {
          color: 'black',
          callback: function(value) {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace('.', ',')}M Kč`;
            if (value >= 1000) return `${(value / 1000).toFixed(1).replace('.', ',')}K Kč`;
            return `${value} Kč`;
          },
        },
        beginAtZero: true,
      },
    },
    hover: {
        mode: 'index',
        intersect: false,
    },
    interaction: {
        mode: 'index',
        intersect: false,
    }
  };

  useEffect(() => {
    return () => {
      const tooltipEl = document.getElementById('chartjs-tooltip-simple');
      const hoverLineEl = document.getElementById('chartjs-hover-line-simple');
      if (tooltipEl) {
        tooltipEl.remove();
      }
      if (hoverLineEl) {
        hoverLineEl.remove();
      }
    };
  }, []);

  // Funkce pro resetování formuláře
  const resetForm = () => {
    setInitialInvestment(0);
    setMonthlyContribution(0);
    setAnnualReturnRate(0);
    setTotalYears(0);
  };


  return (
    // Celkové pozadí a text barvy jako v InvestmentComparisonCalculator
    // Změna: max-w-screen-xl nebo max-w-screen-2xl pro širší obsah, nebo úplně odebrat pro 100% šířku
    <div className="bg-gradient-to-b from-indigo-600 to-indigo-50 text-gray-800 min-h-screen rounded-lg py-12 px-4 sm:px-6 lg:px-8">
      {/* Hlavní kontejner pro obsah, nastaveno na max-w-screen-xl, aby bylo širší */}
      <div className="max-w-screen-xl mx-auto"> 
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-10 audiowide-regular text-white">
          Kalkulačka složeného úročení
        </h1>

        {/* Přehled výsledků nahoře - stejné barvy jako v InvestmentComparisonCalculator */}
        <div className="flex flex-wrap justify-center items-center gap-6 mb-12 text-white">
            <div className="flex items-center space-x-3">
                <span className="w-4 h-4 rounded-full bg-purple-400"></span>
                <span className="text-lg sm:text-xl font-medium">Investovaná částka:</span>
                <span className="text-xl sm:text-3xl font-bold tracking-tight">
                    {formatCurrency(finalResult.invested)}
                </span>
            </div>
            <div className="flex items-center space-x-3">
                <span className="w-4 h-4 rounded-full bg-green-500"></span>
                <span className="text-lg sm:text-xl font-medium">Obdržený úrok:</span>
                <span className="text-xl sm:text-3xl font-bold tracking-tight">
                    {formatCurrency(finalResult.interest)}
                </span>
            </div>
            <div className="flex items-center space-x-3">
                <span className="text-lg sm:text-xl font-medium">Výsledná částka:</span>
                <span className="text-xl sm:text-3xl font-bold tracking-tight">
                    {formatCurrency(finalResult.balance)}
                </span>
            </div>
        </div>

        {/* Formulář s parametry nahoře */}
        <div className="bg-white p-8 rounded-lg shadow-xl mb-12"> {/* mb-12 pro mezeru pod formulářem */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"> {/* Více sloupců pro vstupní pole */}
            <div>
              <label htmlFor="initialInvestment" className="block text-sm font-medium text-gray-700">
                Počáteční jednorázová investice (Kč)
              </label>
              <input
                type="number"
                id="initialInvestment"
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <label htmlFor="monthlyContribution" className="block text-sm font-medium text-gray-700">
                Pravidelná měsíční investice (Kč)
              </label>
              <input
                type="number"
                id="monthlyContribution"
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <label htmlFor="annualReturnRate" className="block text-sm font-medium text-gray-700">
                Předpokládaná roční úroková sazba (%)
              </label>
              <input
                type="number"
                id="annualReturnRate"
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                step="0.1"
                value={annualReturnRate}
                onChange={(e) => setAnnualReturnRate(Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <label htmlFor="totalYears" className="block text-sm font-medium text-gray-700">
                Na kolik let si budu spořit
              </label>
              <input
                type="number"
                id="totalYears"
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                value={totalYears}
                onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setTotalYears(isNaN(value) ? 0 : value);
                }}
                min="0"
              />
            </div>
          </div>

          <div className="flex justify-start space-x-4 mt-6">
            <button
              onClick={() => { /* V budoucnu zde může být logika pro "Spočítat" */ }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700 transition"
              disabled={totalYears <= 0 || isNaN(totalYears)}
            >
              Spočítat
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md shadow-md hover:bg-gray-300 transition"
            >
              Vyčistit
            </button>
          </div>
        </div>

        {/* Graf pod formulářem */}
        <div className="relative h-[400px] md:h-[500px] lg:h-[600px] bg-white rounded-lg p-6 shadow-xl">
          {totalYears > 0 && !isNaN(totalYears) ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-lg">
                Zadejte platné parametry pro zobrazení grafu.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}