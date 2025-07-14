// src/components/InvestmentCalculator.js
import React, { useState, useMemo, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title, // Přidáno Title pro název grafu
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend); // Registrace Title

// Helper function to format numbers as Kč
const formatCurrency = (value) => {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function InvestmentCalculator() {
  const [initialInvestment, setInitialInvestment] = useState(100000);
  const [monthlyContribution, setMonthlyContribution] = useState(2000);
  const [years, setYears] = useState(30);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [entryFeeType, setEntryFeeType] = useState("%");
  const [entryFeeValue, setEntryFeeValue] = useState(1);
  const [annualFee, setAnnualFee] = useState(1); // Toto je roční procento poplatku

  // Výpočet výsledků
  const {
    totalWithoutFees,
    totalWithFees,
    totalEntryFee,
    totalAnnualFees,
    chartDatasets, // Změněno na chartDatasets pro flexibilnější data
  } = useMemo(() => {
    const months = years * 12;
    const monthlyReturnRate = (annualReturn / 100) / 12; // Měsíční výnosová sazba
    const monthlyFeeRate = (annualFee / 100) / 12;     // Měsíční poplatková sazba (z roční)

    // Vstupní poplatek v Kč
    const currentEntryFee =
      entryFeeType === "%"
        ? (initialInvestment * entryFeeValue) / 100
        : entryFeeValue;

    // Počáteční kapitál po odečtení vstupního poplatku, který se odečítá hned na začátku
    const initialCapitalAfterEntryFee = initialInvestment - currentEntryFee;

    // --- Simulace bez poplatků ---
    let balanceWithoutFees = initialInvestment; // Bez poplatků začínáme s plnou počáteční investicí
    let investedWithoutFees = initialInvestment; // Sledujeme celkem vložené (počáteční + měsíční)

    for (let month = 1; month <= months; month++) {
      balanceWithoutFees += monthlyContribution;
      investedWithoutFees += monthlyContribution; // Kumulativní vložené
      balanceWithoutFees += balanceWithoutFees * monthlyReturnRate;
      if (balanceWithoutFees < 0) balanceWithoutFees = 0;
    }
    
    // --- Simulace s poplatky ---
    let balanceWithFees = initialCapitalAfterEntryFee; // S poplatky začínáme s upravenou počáteční investicí
    let totalAnnualFeesAcc = 0; // Akumulátor pro celkové roční poplatky
    let investedWithFees = initialInvestment; // Sledujeme celkem vložené pro variantu s poplatky

    for (let month = 1; month <= months; month++) {
      balanceWithFees += monthlyContribution;
      investedWithFees += monthlyContribution; // Kumulativní vložené
      
      const interestEarnedThisMonth = balanceWithFees * monthlyReturnRate;
      const feeForThisMonth = balanceWithFees * monthlyFeeRate; 

      balanceWithFees += interestEarnedThisMonth;
      balanceWithFees -= feeForThisMonth;
      totalAnnualFeesAcc += feeForThisMonth; 

      if (balanceWithFees < 0) balanceWithFees = 0;
    }

    // Celkový vložený kapitál (počáteční + měsíční vklady)
    const totalCapitalInvested = initialInvestment + (monthlyContribution * years * 12);

    // Výnos bez poplatků = Konečná hodnota bez poplatků - Celkem vložený kapitál
    const pureYieldWithoutFees = balanceWithoutFees - totalCapitalInvested;

    // Výnos s poplatky = Konečná hodnota s poplatky - Celkem vložený kapitál - Celkem zaplacené poplatky (vstupní + roční)
    const pureYieldWithFees = balanceWithFees - totalCapitalInvested + currentEntryFee + totalAnnualFeesAcc;

    // Data pro graf
    const chartDatasets = {
      labels: ["Vložené prostředky", "Hodnota bez poplatků", "Hodnota s poplatky"],
      datasets: [
        {
          label: "Vložený kapitál",
          data: [totalCapitalInvested, totalCapitalInvested, totalCapitalInvested],
          backgroundColor: "rgba(168, 85, 247, 1)", // purple-400
          stack: 'Stack 0', // Všechny se skládají na sebe ve stejné kategorii
          borderColor: "rgba(168, 85, 247, 1)",
          borderWidth: 1,
        },
        {
          label: "Zisk bez poplatků",
          data: [0, Math.max(0, pureYieldWithoutFees), 0], // Jen pro "Hodnotu bez poplatků"
          backgroundColor: "rgba(34, 197, 94, 0.8)", // green-500
          stack: 'Stack 0',
          borderColor: "rgba(34, 197, 94, 1)",
          borderWidth: 1,
        },
        {
          label: "Zaplacené poplatky",
          data: [0, 0, Math.max(0, currentEntryFee + totalAnnualFeesAcc)], // Jen pro "Hodnotu s poplatky"
          backgroundColor: "rgba(239, 68, 68, 0.8)", // red-500
          stack: 'Stack 0',
          borderColor: "rgba(239, 68, 68, 1)",
          borderWidth: 1,
        },
        {
          label: "Zisk s poplatky",
          data: [0, 0, Math.max(0, pureYieldWithFees)], // Jen pro "Hodnotu s poplatky"
          backgroundColor: "rgba(34, 197, 94, 0.8)", // green-500
          stack: 'Stack 0',
          borderColor: "rgba(34, 197, 94, 1)",
          borderWidth: 1,
        },
      ],
    };

    return {
      totalWithoutFees: balanceWithoutFees,
      totalWithFees: balanceWithFees,
      totalEntryFee: currentEntryFee,
      totalAnnualFees: totalAnnualFeesAcc,
      chartDatasets,
    };
  }, [
    initialInvestment,
    monthlyContribution,
    years,
    annualReturn,
    entryFeeType,
    entryFeeValue,
    annualFee,
  ]);

  // Pro ošetření záporného zisku v tooltipu grafu (aby se nezobrazoval "Zisk: -Kč")
  const formatValueForTooltip = (value, label) => {
    if (label.includes("Zisk") && value < 0) {
      return `Ztráta: ${formatCurrency(Math.abs(value))}`;
    }
    if (label.includes("Zaplacené poplatky") && value < 0) {
      return `Zaplacené poplatky: ${formatCurrency(Math.abs(value))}`; // Měly by být kladné, ale pro jistotu
    }
    return `${label}: ${formatCurrency(value)}`;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom', // Legenda dole pro více místa
        labels: {
          color: 'rgb(55, 65, 81)', // gray-700
        }
      },
      title: {
        display: true,
        text: 'Porovnání investičních scénářů',
        color: 'rgb(31, 41, 55)', // gray-900
        font: {
          size: 18,
          weight: 'bold'
        }
      },
      tooltip: {
        enabled: false, // Vypneme defaultní tooltip
        external: function(context) {
          const { chart, tooltip } = context;
          let tooltipEl = document.getElementById('chartjs-tooltip-investment'); // Unikátní ID
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip-investment';
            tooltipEl.className = 'absolute bg-gray-100 text-gray-800 p-3 rounded-lg shadow-lg pointer-events-none transition-opacity duration-150 ease-out z-50';
            document.body.appendChild(tooltipEl);
          }

          if (tooltip.opacity === 0) {
            tooltipEl.style.opacity = '0';
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
            let innerHtml = '<div>';
            titleLines.forEach(function(title) {
              innerHtml += `<div class="font-bold text-sm mb-1">${title}</div>`;
            });
            innerHtml += '</div><div class="space-y-1 mt-2">';

            let totalValue = 0; // Pro celkovou hodnotu sloupce

            tooltip.dataPoints.forEach(function(dataPoint) {
              const label = dataPoint.dataset.label;
              const rawValue = dataPoint.raw;
              totalValue += rawValue; // Sčítáme pro celkovou hodnotu sloupce
              const formattedValue = formatValueForTooltip(rawValue, label); // Formátování s ohledem na zisk/ztrátu
              const colors = dataPoint.dataset.backgroundColor;
              
              let style = `background:${colors}; border-color:${dataPoint.dataset.borderColor}; border-width: 2px; width: 10px; height: 10px; display: inline-block; margin-right: 8px; border-radius: 50%;`;
              innerHtml += `<div class="flex items-center text-sm"><span style="${style}"></span>${formattedValue}</div>`;
            });

            // Přidáme celkovou hodnotu sloupce
            innerHtml += `<div class="font-bold text-base mt-2 pt-2 border-t border-gray-300">Celkem: ${formatCurrency(totalValue)}</div>`;
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
        }
      },
    },
    scales: {
      x: {
        stacked: true, // Sloupce se skládají
        grid: {
          display: false, // Skryjeme mřížku na x ose
          borderColor: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: 'black',
        },
      },
      y: {
        stacked: true, // Sloupce se skládají
        beginAtZero: false, // Může začínat pod nulou, pokud je záporný zisk/ztráta
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
      },
    },
  };

  // Efekt pro čištění tooltipu při unmountu
  useEffect(() => {
    return () => {
      const tooltipEl = document.getElementById('chartjs-tooltip-investment');
      if (tooltipEl) {
        tooltipEl.remove();
      }
    };
  }, []);

  return (
    // Celkové pozadí s gradientem, roztáhlé na 100% šířku
    <div className="bg-gradient-to-b from-indigo-600 to-indigo-50 text-gray-800 min-h-screen rounded-lg py-12 px-4 sm:px-6 lg:px-8">
      {/* Hlavní kontejner pro obsah, nastaveno na max-w-screen-xl (1280px) */}
      <div className="max-w-screen-xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-10 audiowide-regular text-white">
          Investiční kalkulačka
        </h1>

        {/* Přehled výsledků nahoře - stylizovaný jako z první kalkulačky */}
        <div className="flex flex-wrap justify-center items-center gap-6 mb-12 text-white">
            <div className="flex items-center space-x-3">
                <span className="w-4 h-4 rounded-full bg-purple-400"></span>
                <span className="text-lg sm:text-xl font-medium">Hodnota bez poplatků:</span>
                <span className="text-xl sm:text-3xl font-bold tracking-tight">
                    {formatCurrency(totalWithoutFees)}
                </span>
            </div>
            <div className="flex items-center space-x-3">
                <span className="w-4 h-4 rounded-full bg-green-500"></span>
                <span className="text-lg sm:text-xl font-medium">Hodnota po poplatcích:</span>
                <span className="text-xl sm:text-3xl font-bold tracking-tight">
                    {formatCurrency(totalWithFees)}
                </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="w-4 h-4 rounded-full bg-red-500"></span>
                <span className="text-lg sm:text-xl font-medium">Celkem poplatky:</span>
                <span className="text-xl sm:text-3xl font-bold tracking-tight">
                    {formatCurrency(totalEntryFee + totalAnnualFees)}
                </span>
            </div>
        </div>

        {/* Formulář s parametry - stejný styl jako v první kalkulačce */}
        <div className="bg-white p-8 rounded-lg shadow-xl mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"> {/* Rozložení políček */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Počáteční investice (Kč)</label>
              <input
                type="number"
                value={initialInvestment}
                min={0}
                onChange={(e) => setInitialInvestment(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Měsíční vklad (Kč)</label>
              <input
                type="number"
                value={monthlyContribution}
                min={0}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Doba investice (roky)</label>
              <input
                type="number"
                value={years}
                min={1}
                max={100}
                onChange={(e) => setYears(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Roční výnos (%)</label>
              <input
                type="number"
                value={annualReturn}
                min={0}
                max={100}
                step={0.1}
                onChange={(e) => setAnnualReturn(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Typ vstupního poplatku</label>
              <select
                value={entryFeeType}
                onChange={(e) => setEntryFeeType(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              >
                <option value="%">Procento (%)</option>
                <option value="fix">Fixní částka (Kč)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Hodnota vstupního poplatku</label>
              <input
                type="number"
                value={entryFeeValue}
                min={0}
                onChange={(e) => setEntryFeeValue(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Roční správcovský poplatek (%)</label>
              <input
                type="number"
                value={annualFee}
                min={0}
                max={100}
                step={0.01}
                onChange={(e) => setAnnualFee(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              />
            </div>
          </div>
        </div>

        {/* Graf */}
        <div className="relative h-[400px] md:h-[500px] lg:h-[600px] bg-white rounded-lg p-6 shadow-xl">
            <Bar data={chartDatasets} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}