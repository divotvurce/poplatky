import React, { useState, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Registrace komponent Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function InvestmentCalculator() {
  const [initialInvestment, setInitialInvestment] = useState(100000);
  const [monthlyContribution, setMonthlyContribution] = useState(2000);
  const [years, setYears] = useState(30);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [entryFeeType, setEntryFeeType] = useState("%");
  const [entryFeeValue, setEntryFeeValue] = useState(1);
  const [annualFee, setAnnualFee] = useState(1);

  // Výpočet výsledků
  const {
    totalInvestedCapital,
    totalWithoutFees,
    totalWithFees,
    totalEntryFee,
    totalAnnualFees, // Tato proměnná stále obsahuje součet za celé období
    dataForChart,
  } = useMemo(() => {
    const months = years * 12;
    // Měsíční výnos je efektivní úroková míra.
    // Příklad: (1 + 0.07)^(1/12) - 1
    const monthlyReturn = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;

    // --- Vstupní poplatek ---
    // Vstupní poplatek se platí z počáteční investice
    const entryFeeAmount =
      entryFeeType === "%"
        ? (initialInvestment * entryFeeValue) / 100
        : entryFeeValue;

    // --- Simulace bez poplatků ---
    let balanceWithoutFees = initialInvestment;
    // Měsíční příspěvky a jejich zhodnocení
    for (let month = 1; month <= months; month++) {
      balanceWithoutFees = balanceWithoutFees * (1 + monthlyReturn) + monthlyContribution;
    }

    // --- Simulace s poplatky ---
    // Startovní kapitál po odečtení vstupního poplatku
    let balanceWithFees = initialInvestment - entryFeeAmount; 
    let totalAnnualFeesAccrued = 0; // Akumulátor celkových ročních poplatků

    for (let month = 1; month <= months; month++) {
      // Zhodnocení
      balanceWithFees = balanceWithFees * (1 + monthlyReturn) + monthlyContribution;

      // Roční správcovský poplatek (odečítáme 1x ročně na konci roku)
      if (month % 12 === 0) {
        const fee = (balanceWithFees * annualFee) / 100;
        balanceWithFees -= fee;
        totalAnnualFeesAccrued += fee;
      }
    }

    // --- Celkové souhrny ---
    const finalTotalWithoutFees = balanceWithoutFees;
    const finalTotalWithFees = balanceWithFees;
    const finalTotalEntryFee = entryFeeAmount;
    const finalTotalAnnualFees = totalAnnualFeesAccrued; // Toto je součet za celé období
    
    // Celkový kapitál, který byl vložen (počáteční + všechny měsíční)
    const finalTotalInvestedCapital = initialInvestment + (monthlyContribution * months);

    // --- Data pro graf ---
    // Definujeme barvy
    const chartColors = {
      invested: "#3b82f6", // Modrá
      withoutFees: "#22c55e", // Zelená (bez poplatků)
      withFees: "#059669", // Tmavší zelená (s poplatky)
      fees: "#ef4444", // Červená (poplatky)
    };

    // Graf bude ukazovat hlavní výsledky pro snadné srovnání
    const dataForChart = {
      labels: [
        "Celkem Vloženo",
        "Hodnota bez poplatků",
        "Hodnota po odečtení poplatků",
        "Celkem zaplacené poplatky", // Změněno zde
      ],
      datasets: [
        {
          label: "Kč",
          data: [
            finalTotalInvestedCapital,
            finalTotalWithoutFees,
            finalTotalWithFees,
            finalTotalEntryFee + finalTotalAnnualFees, // Součet všech poplatků
          ],
          backgroundColor: [
            chartColors.invested,
            chartColors.withoutFees,
            chartColors.withFees,
            chartColors.fees,
          ],
        },
      ],
    };

    return {
      totalInvestedCapital: finalTotalInvestedCapital,
      totalWithoutFees: finalTotalWithoutFees,
      totalWithFees: finalTotalWithFees,
      totalEntryFee: finalTotalEntryFee,
      totalAnnualFees: finalTotalAnnualFees,
      dataForChart,
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

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Investiční kalkulačka</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Počáteční investice */}
        <div>
          <label htmlFor="initialInvestment" className="block font-semibold mb-1">Počáteční investice (Kč)</label>
          <input
            id="initialInvestment"
            type="number"
            value={initialInvestment}
            min={0}
            onChange={(e) => setInitialInvestment(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Měsíční vklad */}
        <div>
          <label htmlFor="monthlyContribution" className="block font-semibold mb-1">Pravidelný měsíční vklad (Kč)</label>
          <input
            id="monthlyContribution"
            type="number"
            value={monthlyContribution}
            min={0}
            onChange={(e) => setMonthlyContribution(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Doba v letech */}
        <div>
          <label htmlFor="years" className="block font-semibold mb-1">Doba investice (roky)</label>
          <input
            id="years"
            type="number"
            value={years}
            min={1}
            max={100}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Roční výnos */}
        <div>
          <label htmlFor="annualReturn" className="block font-semibold mb-1">Roční výnos (%)</label>
          <input
            id="annualReturn"
            type="number"
            value={annualReturn}
            min={0}
            max={100}
            step={0.1}
            onChange={(e) => setAnnualReturn(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Typ vstupního poplatku */}
        <div>
          <label htmlFor="entryFeeType" className="block font-semibold mb-1">Typ vstupního poplatku</label>
          <select
            id="entryFeeType"
            value={entryFeeType}
            onChange={(e) => setEntryFeeType(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="%">Procento (%)</option>
            <option value="fix">Fixní částka (Kč)</option>
          </select>
        </div>

        {/* Hodnota vstupního poplatku */}
        <div>
          <label htmlFor="entryFeeValue" className="block font-semibold mb-1">Hodnota vstupního poplatku</label>
          <input
            id="entryFeeValue"
            type="number"
            value={entryFeeValue}
            min={0}
            onChange={(e) => setEntryFeeValue(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Roční správcovský poplatek */}
        <div>
          <label htmlFor="annualFee" className="block font-semibold mb-1">Roční správcovský poplatek (%)</label>
          <input
            id="annualFee"
            type="number"
            value={annualFee}
            min={0}
            max={100}
            step={0.01}
            onChange={(e) => setAnnualFee(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Výsledky */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <p>
          <strong>Celkem vložený kapitál:</strong>{" "}
          {totalInvestedCapital.toLocaleString("cs-CZ", { maximumFractionDigits: 0 })} Kč
        </p>
        <p>
          <strong>Celková hodnota bez poplatků:</strong>{" "}
          {totalWithoutFees.toLocaleString("cs-CZ", { maximumFractionDigits: 0 })} Kč
        </p>
        <p>
          <strong>Celková hodnota po odečtení poplatků:</strong>{" "}
          {totalWithFees.toLocaleString("cs-CZ", { maximumFractionDigits: 0 })} Kč
        </p>
        <p>
          <strong>Zaplacený vstupní poplatek:</strong>{" "}
          {totalEntryFee.toLocaleString("cs-CZ", { maximumFractionDigits: 0 })} Kč
        </p>
        <p>
          <strong>Celkem zaplacené roční poplatky (za celé období):</strong>{" "} {/* Změněno zde */}
          {totalAnnualFees.toLocaleString("cs-CZ", { maximumFractionDigits: 0 })} Kč
        </p>
        <p className="mt-4 text-lg font-bold">
            **Čistý zisk (bez poplatků):**{" "}
            {(totalWithoutFees - totalInvestedCapital).toLocaleString("cs-CZ", { maximumFractionDigits: 0 })} Kč
        </p>
        <p className="text-lg font-bold">
            **Čistý zisk (po poplatcích):**{" "}
            {(totalWithFees - totalInvestedCapital).toLocaleString("cs-CZ", { maximumFractionDigits: 0 })} Kč
        </p>
      </div>

      {/* Graf */}
      <Bar
        data={dataForChart}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Přehled investice a dopadu poplatků" },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(value);
                }
              }
            },
          },
        }}
      />
    </div>
  );
}