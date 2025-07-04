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
    totalWithoutFees,
    totalWithFees,
    totalEntryFee,
    totalAnnualFees,
    dataForChart,
  } = useMemo(() => {
    const months = years * 12;
    const monthlyReturn = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;

    // Vstupní poplatek v Kč
    const entryFee =
      entryFeeType === "%"
        ? (initialInvestment * entryFeeValue) / 100
        : entryFeeValue;

    // Investice po odečtení vstupního poplatku (pokud procentní, odečteme hned na začátku)
    const investedInitial = initialInvestment - entryFee;

    let balanceWithoutFees = investedInitial;
    let balanceWithFees = investedInitial;
    let totalAnnualFeesAcc = 0;

    // Pravidelný měsíční příspěvek bereme bez vstupního poplatku
    for (let month = 1; month <= months; month++) {
      // Výnos bez poplatků
      balanceWithoutFees = balanceWithoutFees * (1 + monthlyReturn) + monthlyContribution;

      // Výnos s poplatky
      balanceWithFees = balanceWithFees * (1 + monthlyReturn) + monthlyContribution;

      // Roční správcovský poplatek (odečítáme 1x ročně na konci roku)
      if (month % 12 === 0) {
        const fee = (balanceWithFees * annualFee) / 100;
        balanceWithFees -= fee;
        totalAnnualFeesAcc += fee;
      }
    }

    // Celkový vstupní poplatek (fixní nebo procentní)
    const totalEntryFee = entryFee;

    const totalWithoutFees = balanceWithoutFees;
    const totalWithFees = balanceWithFees;
    const totalAnnualFees = totalAnnualFeesAcc;

    // Data pro graf: poplatky + zhodnocení
    const dataForChart = {
      labels: ["Investice", "Vstupní poplatek", "Roční poplatky", "Výnos"],
      datasets: [
        {
          label: "Kč",
          data: [
            initialInvestment,
            totalEntryFee,
            totalAnnualFees,
            totalWithoutFees - initialInvestment,
          ],
          backgroundColor: [
            "#3b82f6", // modrá (investice)
            "#ef4444", // červená (vstupní poplatek)
            "#f97316", // oranžová (roční poplatky)
            "#22c55e", // zelená (výnos)
          ],
        },
      ],
    };

    return {
      totalWithoutFees,
      totalWithFees,
      totalEntryFee,
      totalAnnualFees,
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
          <label className="block font-semibold mb-1">Počáteční investice (Kč)</label>
          <input
            type="number"
            value={initialInvestment}
            min={0}
            onChange={(e) => setInitialInvestment(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* Měsíční vklad */}
        <div>
          <label className="block font-semibold mb-1">Pravidelný měsíční vklad (Kč)</label>
          <input
            type="number"
            value={monthlyContribution}
            min={0}
            onChange={(e) => setMonthlyContribution(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* Doba v letech */}
        <div>
          <label className="block font-semibold mb-1">Doba investice (roky)</label>
          <input
            type="number"
            value={years}
            min={1}
            max={100}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* Roční výnos */}
        <div>
          <label className="block font-semibold mb-1">Roční výnos (%)</label>
          <input
            type="number"
            value={annualReturn}
            min={0}
            max={100}
            step={0.1}
            onChange={(e) => setAnnualReturn(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* Typ vstupního poplatku */}
        <div>
          <label className="block font-semibold mb-1">Typ vstupního poplatku</label>
          <select
            value={entryFeeType}
            onChange={(e) => setEntryFeeType(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="%">Procento (%)</option>
            <option value="fix">Fixní částka (Kč)</option>
          </select>
        </div>

        {/* Hodnota vstupního poplatku */}
        <div>
          <label className="block font-semibold mb-1">Hodnota vstupního poplatku</label>
          <input
            type="number"
            value={entryFeeValue}
            min={0}
            onChange={(e) => setEntryFeeValue(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {/* Roční správcovský poplatek */}
        <div>
          <label className="block font-semibold mb-1">Roční správcovský poplatek (%)</label>
          <input
            type="number"
            value={annualFee}
            min={0}
            max={100}
            step={0.01}
            onChange={(e) => setAnnualFee(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
      </div>

      {/* Výsledky */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
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
          <strong>Zaplacené roční poplatky:</strong>{" "}
          {totalAnnualFees.toLocaleString("cs-CZ", { maximumFractionDigits: 0 })} Kč
        </p>
      </div>

      {/* Graf */}
      <Bar
        data={dataForChart}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Rozložení investice a poplatků" },
          },
          scales: {
            y: { beginAtZero: true },
          },
        }}
      />
    </div>
  );
}
