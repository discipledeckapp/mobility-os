'use client';

import type { Route } from 'next';
import { Button, Input } from '@mobility-os/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function PersonLookupForm({
  initialQuery = '',
  riskBand = '',
  countryCode = '',
  watchlistStatus = '',
  reviewState = '',
  roleType = '',
  reverificationRequired = '',
}: {
  initialQuery?: string;
  riskBand?: string;
  countryCode?: string;
  watchlistStatus?: string;
  reviewState?: string;
  roleType?: string;
  reverificationRequired?: string;
}) {
  const router = useRouter();
  const [personId, setPersonId] = useState(initialQuery);
  const [band, setBand] = useState(riskBand);
  const [country, setCountry] = useState(countryCode);
  const [watchlist, setWatchlist] = useState(watchlistStatus);
  const [review, setReview] = useState(reviewState);
  const [role, setRole] = useState(roleType);
  const [reverification, setReverification] = useState(reverificationRequired);

  return (
    <form
      className="flex flex-wrap gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const params = new URLSearchParams();
        const normalized = personId.trim();
        if (normalized) params.set('q', normalized);
        if (band) params.set('riskBand', band);
        if (country.trim()) params.set('countryCode', country.trim().toUpperCase());
        if (watchlist) params.set('watchlistStatus', watchlist);
        if (review) params.set('reviewState', review);
        if (role) params.set('roleType', role);
        if (reverification) params.set('reverificationRequired', reverification);
        router.push(
          (`/intelligence/persons${params.toString() ? `?${params.toString()}` : ''}`) as Route,
        );
      }}
    >
      <Input
        className="min-w-[280px]"
        name="personId"
        onChange={(event) => setPersonId(event.target.value)}
        placeholder="Search by person code, name, or person id"
        value={personId}
      />
      <Input
        className="w-[120px]"
        name="riskBand"
        onChange={(event) => setBand(event.target.value)}
        placeholder="risk band"
        value={band}
      />
      <Input
        className="w-[100px]"
        name="countryCode"
        onChange={(event) => setCountry(event.target.value)}
        placeholder="country"
        value={country}
      />
      <Input
        className="w-[140px]"
        name="watchlistStatus"
        onChange={(event) => setWatchlist(event.target.value)}
        placeholder="watchlist"
        value={watchlist}
      />
      <Input
        className="w-[140px]"
        name="reviewState"
        onChange={(event) => setReview(event.target.value)}
        placeholder="review state"
        value={review}
      />
      <Input
        className="w-[120px]"
        name="roleType"
        onChange={(event) => setRole(event.target.value)}
        placeholder="role"
        value={role}
      />
      <Input
        className="w-[160px]"
        name="reverificationRequired"
        onChange={(event) => setReverification(event.target.value)}
        placeholder="reverification"
        value={reverification}
      />
      <Button type="submit">Search</Button>
    </form>
  );
}
