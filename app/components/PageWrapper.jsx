'use client';

export default function PageWrapper({ children }) {
  return (
    <div className="min-h-screen bg-[#eaf0f2]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
