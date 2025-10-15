import React from 'react';


const bgStyle: React.CSSProperties = {
background: 'linear-gradient(180deg, #fffdf8 0%, #fffbf5 100%)',
color: '#2b2b2b',
};


export function AboutPage(): JSX.Element {
return (
<div style={bgStyle} className="min-h-screen p-8 sm:p-12">
<div className="max-w-4xl mx-auto">
<div className="rounded-2xl p-8 sm:p-12 shadow-lg" style={{ background: 'rgba(255,255,255,0.9)' }}>
<header className="flex items-start gap-4 mb-6">
<div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: '#fff6ee' }}>
<span className="text-2xl font-bold" style={{ color: '#b15b2a' }}>RK</span>
</div>
<div>
<h1 className="text-3xl font-semibold">About RK Store</h1>
<p className="mt-1 text-sm text-gray-600">Home décor • Candles • Artificial Women's Jewellery</p>
</div>
</header>


<section className="prose prose-lg text-gray-700">
<p>
Welcome to <strong>RK Store</strong>, your trusted online destination for carefully curated home décor, handcrafted candles, and elegant artificial women’s jewellery. We aim to
bring style, warmth, and personality to your living spaces and accessories.
</p>


<p>
Our collection includes a wide range of items — from decorative pieces and scented candles to statement and everyday jewellery. Each product is selected for its quality,
design, and value.
</p>


<p>
At RK Store, customer satisfaction is our top priority. We focus on offering reliable service, premium products, and a smooth shopping experience.
</p>


<p className="mt-4 text-sm text-gray-600">Thank you for choosing RK Store — where beauty meets creativity.</p>
</section>
</div>
</div>
</div>
);
}


export default AboutPage;
