'use client';

/** Soft centered kudu watermark for every page canvas */
export default function KuduWatermark() {
  return (
    <div className="kudu-watermark" aria-hidden>
      <img src="/KUDU.jpg" alt="" className="kudu-watermark-img" />
    </div>
  );
}
