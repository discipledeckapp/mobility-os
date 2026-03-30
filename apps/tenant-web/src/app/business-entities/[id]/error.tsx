'use client';

export default function BusinessEntityDetailError() {
  return (
    <div className="rounded-[24px] border border-red-200 bg-red-50 px-6 py-8 text-red-900">
      <h2 className="text-lg font-semibold tracking-[-0.03em]">
        Unable to load business entity
      </h2>
      <p className="mt-2 text-sm text-red-800">
        The business-entity command center could not be loaded right now. Please try again shortly.
      </p>
    </div>
  );
}
