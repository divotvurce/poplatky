import React from "react";

export default function AboutPage() {
  return (
    <div className="bg-white text-gray-800 px-6 py-12 max-w-4xl mx-auto">
      <h1 className="text-4xl font-extrabold text-indigo-900 mb-8">O projektu</h1>

      <section className="space-y-6 text-lg leading-relaxed text-gray-700">
        <p>
          Na úvod: nejsem finanční poradce a nic z toho, co zde najdete, neslouží jako investiční doporučení. Tato stránka je čistě informativní a vznikla s cílem zvyšovat povědomí o tom, kolik nás doopravdy stojí investování – a proč je dobré rozumět poplatkům.
        </p>

        <h2 className="text-2xl font-bold text-indigo-800 mt-8">Proč Transparentní Poplatky?</h2>
        <p>
          V dnešní době investuje nebo plánuje investovat téměř každý. Internet nabízí množství návodů a možností, jak začít. A i když je to jednodušší než dřív, zároveň je mnohem jednodušší naletět – ať už podvodníkům, nebo nepoctivým zprostředkovatelům.
        </p>
        <p>
          Web TransparentníPoplatky.cz vznikl právě proto, aby poskytl jednoduché a srozumitelné nástroje, které pomohou lidem udělat informovaná rozhodnutí. Neříkám, co je dobře a co špatně – pouze nabízím pohled, který může otevřít oči.
        </p>

        <h2 className="text-2xl font-bold text-indigo-800 mt-8">Finanční poradci – ano, ale pozor</h2>
        <p>
          Věřím, že existují kvalitní a poctiví poradci, kteří klientům opravdu pomáhají. Ale realita ukazuje, že takových je menšina. Tato stránka nemá být útokem na profesi, ale výzvou k větší transparentnosti, férovosti a důvěře podložené fakty.
        </p>

        <h2 className="text-2xl font-bold text-indigo-800 mt-8">Co na stránce najdete?</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>Interaktivní kalkulačky pro výpočet dopadu poplatků na investice</li>
          <li>Skutečné příběhy lidí, kteří byli nepoctivě informováni nebo zklamáni</li>
          <li>Plánovaná srovnání fondů a investičních alternativ</li>
        </ul>
        <p>
          Veškerý obsah je zdarma a dostupný komukoliv. Neposkytuji poradenství, nenabízím produkty, nepropaguji žádné firmy.
        </p>

        <h2 className="text-2xl font-bold text-indigo-800 mt-8">Co z toho mám?</h2>
        <p>
          Upřímně – jen dobrý pocit. Tuto stránku tvořím ve volném čase, bez nároku na odměnu. Pokud pomůže někomu předejít špatnému rozhodnutí, má to pro mě smysl.
        </p>

        <h2 className="text-2xl font-bold text-indigo-800 mt-8">Jak můžete přispět?</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>Pošlete svůj příběh nebo zkušenost do sekce „Příběhy“</li>
          <li>Sdílejte stránku dál – i na Instagramu nebo Threads</li>
          <li>Narazíte-li na chybu, dejte mi vědět – rád ji opravím</li>
        </ul>

        <p className="mt-6 italic text-gray-500">
          Každý sdílený příběh nebo zpětná vazba může někomu dalšímu otevřít oči a pomoct mu lépe se zorientovat ve světě investic.
        </p>

        <p className="mt-4">
          Děkuji, že jste tady – a přeji vám bezpečné a informované investování.
        </p>
      </section>
    </div>
  );
}
