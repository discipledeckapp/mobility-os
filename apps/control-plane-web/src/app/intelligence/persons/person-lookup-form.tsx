'use client';

import type { Route } from 'next';
import { Button, Input } from '@mobility-os/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function PersonLookupForm() {
  const router = useRouter();
  const [personId, setPersonId] = useState('');

  return (
    <form
      className="flex flex-wrap gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const normalized = personId.trim();
        if (!normalized) {
          return;
        }
        router.push(`/intelligence/persons/${encodeURIComponent(normalized)}` as Route);
      }}
    >
      <Input
        className="min-w-[280px]"
        name="personId"
        onChange={(event) => setPersonId(event.target.value)}
        placeholder="intel person id"
        value={personId}
      />
      <Button type="submit">Open person record</Button>
    </form>
  );
}
