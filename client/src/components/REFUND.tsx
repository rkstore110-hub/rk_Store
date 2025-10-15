// ------------------------- RefundPolicyPage.tsx -------------------------
import React from 'react';

const bgStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, #fffdf8 0%, #fffbf5 100%)',
  color: '#2b2b2b',
};

export function RefundPolicyPage(): JSX.Element {
  return (
    <div style={bgStyle} className="min-h-screen p-8 sm:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl p-8 sm:p-12 shadow-lg" style={{ background: 'rgba(255,255,255,0.9)' }}>
          <h1 className="text-3xl font-semibold mb-4">Refund & Return Policy</h1>

          <div className="text-gray-700 space-y-4">
            <p>
              At <strong>RK Store</strong>, we strive to ensure that our customers are completely satisfied with their purchases. However, if you are not satisfied, we offer a simple and transparent refund and return process.
            </p>

            <section>
              <h3 className="font-semibold">1. Eligibility for Refund</h3>
              <ul className="list-disc pl-5">
                <li>Only <strong>unused products</strong> reported within <strong>3 days</strong> of delivery are eligible for a refund or replacement.</li>
                <li>If you receive a <strong>damaged or defective product</strong>, please inform us within 3 days of receiving the order.</li>
                <li>Products that have been used, altered, or damaged after delivery are not eligible for return or refund.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold">2. Refund Process</h3>
              <p>
                To initiate a refund, please contact us at <strong>rk.store110@gmail.com</strong> or call us at <strong>7838302860</strong>. Kindly include your order ID, reason for refund, and product photos (if applicable).
              </p>
              <p>
                Once we receive and inspect your returned product, your refund will be processed to the <strong>original payment method</strong> used during the purchase. Refunds typically take <strong>5–7 business days</strong> to reflect, depending on your bank or payment provider.
              </p>
            </section>

            <section>
              <h3 className="font-semibold">3. Shipping Costs</h3>
              <p>
                If you are returning an unused or damaged product, the return shipping cost will be borne by RK Store in case of damage or defect. For voluntary returns, customers may be responsible for shipping charges.
              </p>
            </section>

            <section>
              <h3 className="font-semibold">4. International Orders</h3>
              <p>
                For international customers, refund requests are accepted under the same conditions. However, <strong>international shipping charges are non-refundable</strong> and must be borne by the customer.
              </p>
            </section>

            <section>
              <h3 className="font-semibold">5. Contact Support</h3>
              <p>
                For refund or return-related queries, please reach us at:
              </p>
              <ul className="list-none">
                <li><strong>Email:</strong> rk.store110@gmail.com</li>
                <li><strong>Phone:</strong> 7838302860</li>
              </ul>
            </section>

            <p className="text-sm text-gray-600 mt-4">
              RK Store reserves the right to modify this refund policy at any time without prior notice. Any updates will be reflected on this page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RefundPolicyPage;
