import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
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

// --- logika pro kalkulačku ---
const calculateInvestmentGrowth = (
  initialInvestment,
  monthlyContribution,
  annualReturnRate,
  annualFeeRate,
  years
) => {
  const data = [];
  let balance = Number(initialInvestment) || 0;
  const monthlyCont = Number(monthlyContribution) || 0;
  const annualReturn = Number(annualReturnRate) || 0;
  const annualFee = Number(annualFeeRate) || 0;
  const totalYearsNum = Number(years) || 0;

  const monthlyReturnRate = (annualReturn / 100) / 12;
  const monthlyFeeRate = (annualFee / 100) / 12;

  if (totalYearsNum <= 0) {
    return [{ year: 0, balance: balance }];
  }

  data.push({ year: 0, balance: balance });

  for (let year = 1; year <= totalYearsNum; year++) {
    for (let month = 0; month < 12; month++) {
      balance += monthlyCont;
      
      const interestEarned = balance * monthlyReturnRate;
      const fees = balance * monthlyFeeRate;

      balance += interestEarned;
      balance -= fees;

      if (balance < 0) balance = 0;
    }
    data.push({ year: year, balance: balance });
  }
  return data;
};

// Předdefinované barvy pro linky grafu (zůstanou stejné, protože to jsou barvy linek, ne pozadí)
const CHART_COLORS = [
  'rgba(52, 211, 153, 1)', 
  'rgba(96, 165, 250, 1)', 
  'rgba(251, 191, 36, 1)',
  'rgba(239, 68, 68, 1)',  
  'rgba(168, 85, 247, 1)',
  'rgba(34, 197, 94, 1)',  
  'rgba(255, 159, 64, 1)', 
];

const MAX_INVESTMENTS = 5;

export default function InvestmentComparisonCalculator() {
  const [investments, setInvestments] = useState([
    {
      id: 1,
      name: 'Banka',
      monthlyContribution: 2000,
      annualReturnRate: 0.1,
      annualFeeRate: 0,
      color: CHART_COLORS[0],
      fill: 'start',
      labelColor: CHART_COLORS[0].replace(', 1)', ''),
    },
    {
      id: 2,
      name: 'Finax',
      monthlyContribution: 2000,
      annualReturnRate: 7,
      annualFeeRate: 0.8,
      color: CHART_COLORS[1],
      fill: false,
      labelColor: CHART_COLORS[1].replace(', 1)', ''),
    },
    {
      id: 3,
      name: 'Váš fond',
      monthlyContribution: 2000,
      annualReturnRate: 6,
      annualFeeRate: 1.2,
      color: CHART_COLORS[2],
      fill: false,
      labelColor: CHART_COLORS[2].replace(', 1)', ''),
    },
  ]);

  const [initialInvestment, setInitialInvestment] = useState(0);
  const [totalYears, setTotalYears] = useState(30);

  const generateChartDatasets = useCallback(() => {
    return investments.map((inv) => {
      const dataPoints = calculateInvestmentGrowth(
        initialInvestment,
        inv.monthlyContribution,
        inv.annualReturnRate,
        inv.annualFeeRate,
        totalYears
      );
      return {
        label: inv.name,
        data: dataPoints.map(d => d.balance),
        borderColor: inv.color,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) {
            return;
          }

          if (inv.fill) {
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            const colorBase = inv.labelColor; 
            gradient.addColorStop(0, `${colorBase}, 0.1)`);
            gradient.addColorStop(1, `${colorBase}, 0.5)`);
            return gradient;
          }
          return inv.color;
        },
        fill: inv.fill,
        tension: 0.4,
        pointRadius: 0,
        pointBackgroundColor: inv.labelColor,
        pointBorderColor: inv.labelColor,
      };
    });
  }, [investments, initialInvestment, totalYears]);

  const chartData = {
    labels: Array.from({ length: totalYears + 1 }, (_, i) => (i === 0 ? 'Dnes' : `${i} let`)),
    datasets: generateChartDatasets(),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
        position: 'nearest',
        external: function(context) {
          const { chart, tooltip } = context;
          let tooltipEl = document.getElementById('chartjs-tooltip');
          let hoverLineEl = document.getElementById('chartjs-hover-line');

          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            // Změněno: bg-gray-100, text-gray-800 pro světlý režim tooltipu
            tooltipEl.className = 'absolute bg-gray-100 text-gray-800 p-3 rounded-lg shadow-lg pointer-events-none transition-opacity duration-150 ease-out z-50';
            document.body.appendChild(tooltipEl);
          }
          if (!hoverLineEl) {
              hoverLineEl = document.createElement('div');
              hoverLineEl.id = 'chartjs-hover-line';
              // Změněno: světlější barva čáry na světlém pozadí
              hoverLineEl.className = 'absolute w-px z-40'; 
              hoverLineEl.style.borderLeft = '1px dashed rgba(0, 0, 0, 0.2)'; // Tmavší čára na světlém pozadí
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

          function getBody(bodyItem) {
            return bodyItem.lines;
          }

          if (tooltip.body) {
            const titleLines = tooltip.title || [];
            const bodyLines = tooltip.body.map(getBody);

            let innerHtml = '<div>';
            titleLines.forEach(function(title) {
              innerHtml += '<div class="font-bold text-sm mb-1">' + title + '</div>';
            });
            innerHtml += '</div><div class="space-y-1">';

            bodyLines.forEach(function(body, i) {
              const colors = tooltip.labelColors[i];
              let style = `background:${colors.backgroundColor}; border-color:${colors.borderColor}; border-width: 2px; width: 10px; height: 10px; display: inline-block; margin-right: 8px; border-radius: 50%;`;
              innerHtml += `<div class="flex items-center text-sm"><span style="${style}"></span>${body}</div>`;
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
        grid: {
          // Změněno: světlejší mřížka na světlém pozadí
          color: 'rgba(0, 0, 0, 0.1)', 
          borderColor: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          // Změněno: černý text pro ticky
          color: 'black', 
        },
      },
      y: {
        grid: {
          // Změněno: světlejší mřížka na světlém pozadí
          color: 'rgba(0, 0, 0, 0.1)',
          borderColor: 'rgba(0, 0, 0, 0.1)',
          borderDash: [2, 2],
        },
        ticks: {
          // Změněno: černý text pro ticky
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
      const tooltipEl = document.getElementById('chartjs-tooltip');
      const hoverLineEl = document.getElementById('chartjs-hover-line');
      if (tooltipEl) {
        tooltipEl.remove();
      }
      if (hoverLineEl) {
        hoverLineEl.remove();
      }
    };
  }, []);

  const addInvestment = () => {
    if (investments.length >= MAX_INVESTMENTS) {
      alert(`Maximální počet srovnání je ${MAX_INVESTMENTS}.`);
      return;
    }

    const newId = investments.length > 0 ? Math.max(...investments.map(i => i.id)) + 1 : 1;
    const newColorIndex = (investments.length) % CHART_COLORS.length;
    const newColor = CHART_COLORS[newColorIndex];

    setInvestments([...investments, {
      id: newId,
      name: `Srovnání ${newId}`,
      monthlyContribution: 2000,
      annualReturnRate: 5,
      annualFeeRate: 0.5,
      color: newColor,
      fill: false,
      labelColor: newColor.replace(', 1)', ''),
    }]);
  };

  const handleInvestmentChange = (id, field, value) => {
    setInvestments(prevInvestments => prevInvestments.map(inv =>
      inv.id === id ? { ...inv, [field]: field === 'name' ? value : Number(value) || 0 } : inv
    ));
  };

  const removeInvestment = (id) => {
    if (investments.length <= 1) {
        alert('Musí zůstat alespoň jedna investiční položka.');
        return;
    }
    setInvestments(investments.filter(inv => inv.id !== id));
  };

  const investmentSummaries = investments.map(inv => {
    const dataPoints = calculateInvestmentGrowth(
      initialInvestment,
      inv.monthlyContribution,
      inv.annualReturnRate,
      inv.annualFeeRate,
      totalYears
    );
    const finalBalance = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].balance : 0;
    return {
      id: inv.id,
      name: inv.name,
      finalBalance: finalBalance,
      color: inv.labelColor,
    };
  });

  return (
    // Změněno: bg-gray-100 pro světlé pozadí stránky, text-gray-800 pro tmavý text
    <div className="bg-gradient-to-b from-indigo-600 to-indigo-50 text-gray-800 min-h-screen rounded-lg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-10 audiowide-regular text-white">
          Srovnání Investičních Alternativ
        </h1>

        {/* Přehled výsledků nahoře - dynamicky pro všechny položky */}
        <div className="flex flex-wrap justify-center items-center gap-6 mb-12">
            {investmentSummaries.map((summary) => (
                <div key={summary.id} className="flex items-center space-x-3">
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: summary.color }}></span>
                    <span className="text-lg sm:text-xl font-medium text-white">{summary.name}:</span>
                    <span className="text-xl sm:text-3xl font-bold tracking-tight text-white">
                        {formatCurrency(summary.finalBalance)}
                    </span>
                </div>
            ))}
        </div>

        {/* Graf */}
        {/* Změněno: bg-white pro světlé pozadí grafu, p-6 pro padding (už tam byl) */}
        <div className="relative h-[400px] md:h-[500px] lg:h-[600px] mb-12 bg-white rounded-lg p-6 shadow-xl">
          {totalYears > 0 && !isNaN(totalYears) ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            // Změněno: text-gray-500 pro světlejší placeholder text
            <div className="flex items-center justify-center h-full text-gray-500 text-lg">
                Zadejte platnou dobu investování pro zobrazení grafu.
            </div>
          )}
        </div>

        {/* Formulář s parametry */}
        {/* Změněno: bg-white pro světlé pozadí formuláře */}
        <div className="bg-white p-8 rounded-lg shadow-xl mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div>
              <label htmlFor="initialInvestment" className="block text-sm font-medium text-gray-700"> {/* Změněno: text-gray-700 */}
                Počáteční investice (Kč)
              </label>
              <input
                type="number"
                id="initialInvestment"
                // Změněno: bg-gray-50, border-gray-300, text-gray-900 pro světlé inputy
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <label htmlFor="totalYears" className="block text-sm font-medium text-gray-700"> {/* Změněno: text-gray-700 */}
                Doba investování (let)
              </label>
              <input
                type="number"
                id="totalYears"
                // Změněno: bg-gray-50, border-gray-300, text-gray-900
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2"
                value={totalYears}
                onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setTotalYears(isNaN(value) ? 0 : value);
                }}
                min="0"
              />
            </div>
            <div className="hidden lg:block"></div>
          </div>

          {investments.map((inv) => (
            <div key={inv.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end mb-6 p-4 rounded-md" style={{ border: `1px solid ${inv.color}` }}>
              <div>
                <label htmlFor={`name-${inv.id}`} className="block text-sm font-medium text-gray-700"> {/* Změněno: text-gray-700 */}
                  Název fondu/nástroje
                </label>
                <input
                  type="text"
                  id={`name-${inv.id}`}
                  // Změněno: bg-gray-50, border-gray-300, text-gray-900
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2"
                  value={inv.name}
                  onChange={(e) => handleInvestmentChange(inv.id, 'name', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`monthlyContribution-${inv.id}`} className="block text-sm font-medium text-gray-700"> {/* Změněno: text-gray-700 */}
                  Měsíční vklad (Kč)
                </label>
                <input
                  type="number"
                  id={`monthlyContribution-${inv.id}`}
                  // Změněno: bg-gray-50, border-gray-300, text-gray-900
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2"
                  value={inv.monthlyContribution}
                  onChange={(e) => handleInvestmentChange(inv.id, 'monthlyContribution', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`annualReturnRate-${inv.id}`} className="block text-sm font-medium text-gray-700"> {/* Změněno: text-gray-700 */}
                  Roční výnos (%)
                </label>
                <input
                  type="number"
                  id={`annualReturnRate-${inv.id}`}
                  // Změněno: bg-gray-50, border-gray-300, text-gray-900
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2"
                  step="0.1"
                  value={inv.annualReturnRate}
                  onChange={(e) => handleInvestmentChange(inv.id, 'annualReturnRate', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`annualFeeRate-${inv.id}`} className="block text-sm font-medium text-gray-700"> {/* Změněno: text-gray-700 */}
                  Roční poplatek (%)
                </label>
                <input
                  type="number"
                  id={`annualFeeRate-${inv.id}`}
                  // Změněno: bg-gray-50, border-gray-300, text-gray-900
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2"
                  step="0.01"
                  value={inv.annualFeeRate}
                  onChange={(e) => handleInvestmentChange(inv.id, 'annualFeeRate', e.target.value)}
                />
              </div>
              <div className="flex justify-end items-end">
                {investments.length > 1 && (
                  <button
                    onClick={() => removeInvestment(inv.id)}
                    className="ml-2 px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 transition"
                  >
                    Odstranit
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={addInvestment}
            className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700 transition"
            disabled={investments.length >= MAX_INVESTMENTS}
          >
            Přidat další srovnání
          </button>
          {investments.length >= MAX_INVESTMENTS && (
            <p className="mt-2 text-sm text-red-700">Dosažen maximální počet srovnání ({MAX_INVESTMENTS}).</p> 
          )}
        </div>
      </div>
    </div>
  );
}