ALTER TABLE "assignments"
ADD COLUMN "remittanceModel" TEXT,
ADD COLUMN "remittanceFrequency" TEXT,
ADD COLUMN "remittanceAmountMinorUnits" INTEGER,
ADD COLUMN "remittanceCurrency" TEXT,
ADD COLUMN "remittanceStartDate" TEXT,
ADD COLUMN "remittanceCollectionDay" INTEGER;
