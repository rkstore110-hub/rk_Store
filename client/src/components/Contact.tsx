// ------------------------- ContactPage.tsx -------------------------
import React, { useState } from 'react';


export function ContactPage(): JSX.Element {
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [message, setMessage] = useState('');
const [sent, setSent] = useState(false);


function handleSend() {
// Integrate with your preferred contact endpoint.
// For now we just simulate success.
setSent(true);
setTimeout(() => setSent(false), 3000);
}


return (
<div style={bgStyle} className="min-h-screen p-8 sm:p-12">
<div className="max-w-3xl mx-auto">
<div className="rounded-2xl p-8 sm:p-12 shadow-lg" style={{ background: 'rgba(255,255,255,0.9)' }}>
<h1 className="text-3xl font-semibold mb-4">Contact RK Store</h1>


<p className="text-gray-700">For product inquiries, returns, or support, reach out to us using the details below or send a message using the form.</p>


<div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
<div>
<h4 className="font-semibold">Email</h4>
<p>rk.store110@gmail.com</p>
</div>
<div>
<h4 className="font-semibold">Phone</h4>
<p>7838302860</p>
</div>
</div>


<form className="mt-6 grid grid-cols-1 gap-3" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="p-3 rounded-lg border" required />
<input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="p-3 rounded-lg border" required />
<textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" rows={5} className="p-3 rounded-lg border" required />


<div className="flex items-center gap-3">
<button type="submit" className="px-4 py-2 rounded-lg font-medium" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>Send Message</button>
<span className="text-sm text-gray-600">Or call us at <strong>7838302860</strong></span>
</div>


{sent && <p className="mt-2 text-sm text-green-600">Message sent! We'll get back to you soon.</p>}
</form>


</div>
</div>
</div>
);
}


export default ContactPage;
