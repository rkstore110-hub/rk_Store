import React from 'react';


export function TermsPage(): JSX.Element {
return (
<div style={bgStyle} className="min-h-screen p-8 sm:p-12">
<div className="max-w-4xl mx-auto">
<div className="rounded-2xl p-8 sm:p-12 shadow-lg" style={{ background: 'rgba(255,255,255,0.9)' }}>
<h1 className="text-3xl font-semibold mb-4">Terms & Conditions</h1>


<div className="text-gray-700 space-y-4">
<section>
<h3 className="font-semibold">1. Acceptance</h3>
<p>By using RK Store and placing an order you agree to these Terms & Conditions.</p>
</section>


<section>
<h3 className="font-semibold">2. Products</h3>
<p>RK Store offers multiple categories including home décor, candles, and artificial women's jewellery. Product images are representative; slight variations may occur.</p>
</section>


<section>
<h3 className="font-semibold">3. Orders & Payments</h3>
<p>Orders are confirmed after successful payment via <strong>Razorpay</strong>. RK Store may cancel orders due to stock issues or suspected fraud. Refunds for cancelled orders follow Razorpay and RK Store procedures.</p>
</section>


<section>
<h3 className="font-semibold">4. Shipping</h3>
<p>We ship across India and accept international orders. International customers are responsible for additional shipping and customs charges.</p>
</section>


<section>
<h3 className="font-semibold">5. Returns & Refunds</h3>
<p>Returns/refunds accepted for:</p>
<ul className="list-disc pl-5">
<li>Unused products reported within <strong>3 days</strong> of delivery</li>
<li>Products received damaged or defective (please provide photos)</li>
</ul>
<p>To request a return/refund, contact <strong>7838302860</strong> or <strong>rk.store110@gmail.com</strong> with order details and photos. Refunds are processed to the original payment method after inspection.</p>
</section>


<section>
<h3 className="font-semibold">6. Liability</h3>
<p>RK Store is not liable for delays or losses caused by couriers, customs, or force majeure. Our liability is limited to the value of the purchased product.</p>
</section>


<section>
<h3 className="font-semibold">7. Governing Law</h3>
<p>These terms are governed by the laws of India.</p>
</section>
</div>
</div>
</div>
</div>
);
}


export default TermsPage;
