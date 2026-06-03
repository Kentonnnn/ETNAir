-- CreateTable
CREATE TABLE "listing_images" (
  "id" SERIAL PRIMARY KEY,
  "url" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "listing_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint
ALTER TABLE "listing_images"
  ADD CONSTRAINT "listing_images_listing_id_fkey"
  FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
