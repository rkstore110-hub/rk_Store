import React from 'react';


export function PrivacyPolicyPage(): JSX.Element {
return (
<div style={bgStyle} className="min-h-screen p-8 sm:p-12">
<div className="max-w-4xl mx-auto">
<div className="rounded-2xl p-8 sm:p-12 shadow-lg" style={{ background: 'rgba(255,255,255,0.9)' }}>
<h1 className="text-3xl font-semibold mb-4">Privacy Policy</h1>


<div className="text-gray-700 space-y-4">
<p>
RK Store values your privacy and is committed to protecting your personal information. This policy explains which data we collect and how we use it to serve you better.
</p>


<h3 className="font-semibold">Information We Collect</h3>
<ul className="list-disc pl-5">
<li>Contact details (name, email, phone number, shipping address)</li>
<li>Order and transaction details</li>
<li>Optional subscription and marketing preferences</li>
</ul>


<h3 className="font-semibold">How We Use Your Data</h3>
<p>We use your information to process orders, communicate order status, provide customer support, and improve our services.</p>


<h3 className="font-semibold">Payments</h3>
<p>
All payments on RK Store are processed through <strong>Razorpay</strong>. Razorpay handles payment authorization and processing using secure, industry-standard encryption.
RK Store does not store full card details on our servers. By making a payment you agree to Razorpay’s terms and secure processing.
</p>


<h3 className="font-semibold">Sharing & Third Parties</h3>
<p>We do not sell or rent your personal information. We may share necessary details with logistics partners and payment processors to fulfill orders.</p>


<h3 className="font-semibold">Contact</h3>
<p>If you have questions about this policy, please contact us at <strong>rk.store110@gmail.com</strong>.</p>
</div>
</div>
</div>
</div>
);
}


export default PrivacyPolicyPage;
