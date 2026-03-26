-- Make driver firstName, lastName, and phone nullable so admin can create a
-- driver record with only an email address, and the driver completes their
-- profile via the self-service onboarding flow.
ALTER TABLE "drivers" ALTER COLUMN "firstName" DROP NOT NULL;
ALTER TABLE "drivers" ALTER COLUMN "lastName" DROP NOT NULL;
ALTER TABLE "drivers" ALTER COLUMN "phone" DROP NOT NULL;
