import { NotFoundException } from '@nestjs/common';
import { PersonsService } from './persons.service';

describe('PersonsService', () => {
  const prisma = {
    intelPerson: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    intelPersonTenantPresence: {
      upsert: jest.fn(),
    },
  };

  let service: PersonsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PersonsService(prisma as never);
  });

  it('applies canonical identity enrichment to the person record', async () => {
    prisma.intelPerson.findUnique.mockResolvedValue({ id: 'person_1' });
    prisma.intelPerson.update.mockResolvedValue({
      id: 'person_1',
      fullName: 'Ada Okafor',
      dateOfBirth: '1992-10-03',
      address: '12 Marina, Lagos',
      gender: 'female',
      photoUrl: 'https://example.com/photo.jpg',
      verificationStatus: 'verified',
      verificationProvider: 'youverify',
      verificationCountryCode: 'NG',
      verificationConfidence: 0.95,
    });

    await service.applyIdentityEnrichment({
      personId: 'person_1',
      fullName: 'Ada Okafor',
      dateOfBirth: '1992-10-03',
      address: '12 Marina, Lagos',
      gender: 'female',
      photoUrl: 'https://example.com/photo.jpg',
      verificationStatus: 'verified',
      verificationProvider: 'youverify',
      verificationCountryCode: 'NG',
      verificationConfidence: 0.95,
    });

    expect(prisma.intelPerson.update).toHaveBeenCalledWith({
      where: { id: 'person_1' },
      data: {
        fullName: 'Ada Okafor',
        dateOfBirth: '1992-10-03',
        address: '12 Marina, Lagos',
        gender: 'female',
        photoUrl: 'https://example.com/photo.jpg',
        verificationStatus: 'verified',
        verificationProvider: 'youverify',
        verificationCountryCode: 'NG',
        verificationConfidence: 0.95,
      },
    });
  });

  it('throws when enrichment is applied to a missing person', async () => {
    prisma.intelPerson.findUnique.mockResolvedValue(null);

    await expect(
      service.applyIdentityEnrichment({
        personId: 'missing_person',
        verificationStatus: 'verified',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.intelPerson.update).not.toHaveBeenCalled();
  });

  it('returns derived-only tenant query signals without raw canonical profile fields', async () => {
    prisma.intelPerson.findUnique.mockResolvedValue({
      id: 'person_1',
      fullName: 'Ada Okafor',
      dateOfBirth: '1992-10-03',
      address: '12 Marina, Lagos',
      gender: 'female',
      globalRiskScore: 12,
      isWatchlisted: false,
      hasDuplicateFlag: false,
      fraudSignalCount: 0,
      verificationConfidence: 0.95,
      verificationStatus: 'verified',
      verificationProvider: 'youverify',
      verificationCountryCode: 'NG',
      photoUrl: 'https://example.com/photo.jpg',
    });

    await expect(service.queryForTenant('person_1')).resolves.toEqual(
      expect.objectContaining({
        personId: 'person_1',
        globalRiskScore: 12,
        riskBand: 'low',
        isWatchlisted: false,
        hasDuplicateIdentityFlag: false,
        verificationStatus: 'verified',
      }),
    );
  });
});
