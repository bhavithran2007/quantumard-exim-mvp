"use client";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/ui/PageHeader";
import { rfqs } from "@/lib/data";
import { supplierComparison } from "@/lib/data";
import { Star, CheckCircle, Trophy } from "lucide-react";
import { useState } from "react";

function ScoreBar({ score }: { score: number }) {
  const color = score >= 90 ? "bg-green-500" : score >= 80 ? "bg-yellow-500" : "bg-orange-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-medium">{score}</span>
    </div>
  );
}

export default function ComparisonPage() {
  const [selectedRfq, setSelectedRfq] = useState(rfqs[0]?.rfqNumber || "");

  // Best supplier: highest reliability & lowest price
  const bestIdx = supplierComparison.reduce((best, s, i) =>
    s.reliabilityScore > supplierComparison[best].reliabilityScore ? i : best, 0);

  return (
    <AppLayout>
      <div className="p-6">
        <PageHeader title="Supplier Comparison" subtitle="Compare suppliers for an RFQ and select the best fit" />

        <div className="flex items-center gap-3 mb-6">
          <label className="text-sm text-gray-600 font-medium">Select RFQ:</label>
          <select className="text-sm border border-gray-200 rounded px-3 py-1.5 focus:outline-none focus:border-blue-400"
            value={selectedRfq} onChange={e => setSelectedRfq(e.target.value)}>
            {rfqs.map(r => <option key={r.id} value={r.rfqNumber}>{r.rfqNumber} — {r.product} ({r.buyer})</option>)}
          </select>
        </div>

        {/* Selected RFQ info */}
        {selectedRfq && (() => {
          const rfq = rfqs.find(r => r.rfqNumber === selectedRfq);
          return rfq ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="text-sm font-semibold text-blue-800 mb-2">{rfq.rfqNumber} — {rfq.product}</div>
              <div className="flex flex-wrap gap-4 text-sm text-blue-700">
                <span>Buyer: <strong>{rfq.buyer}</strong></span>
                <span>Quantity: <strong>{rfq.quantity.toLocaleString()} {rfq.unit}</strong></span>
                <span>Deadline: <strong>{rfq.deadline}</strong></span>
                {rfq.specifications && <span>Specs: <strong>{rfq.specifications}</strong></span>}
              </div>
            </div>
          ) : null;
        })()}

        {/* Comparison Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase">Supplier</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase">Unit Price</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase">MOQ</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase">Lead Time</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase">Reliability</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase">Rating</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {supplierComparison.map((s, i) => (
                <tr key={s.supplier} className={`border-b border-gray-100 ${i === bestIdx ? "bg-green-50" : "hover:bg-gray-50"}`}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {i === bestIdx && <Trophy size={16} className="text-yellow-500" />}
                      <span className="font-medium text-gray-900">{s.supplier}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`font-bold text-base ${i === 0 ? "text-green-700" : "text-gray-700"}`}>${s.price.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{s.moq}</td>
                  <td className="px-4 py-4 text-gray-600">{s.leadTime}</td>
                  <td className="px-4 py-4"><ScoreBar score={s.reliabilityScore} /></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} size={13} className={star <= Math.round(s.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">{s.rating}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {i === bestIdx ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        <CheckCircle size={12} /> Recommended
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recommendation summary */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={18} className="text-yellow-500" />
            <h3 className="font-semibold text-green-800">Recommended Supplier</h3>
          </div>
          <p className="text-sm text-green-700">
            <strong>{supplierComparison[bestIdx].supplier}</strong> is recommended based on the highest reliability score 
            ({supplierComparison[bestIdx].reliabilityScore}/100) and competitive pricing (${supplierComparison[bestIdx].price.toFixed(2)}/unit).
            Estimated delivery in {supplierComparison[bestIdx].leadTime}.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
