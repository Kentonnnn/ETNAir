-- AlterTable: add cancel_deadline to bookings
ALTER TABLE "bookings" ADD COLUMN "cancel_deadline" TIMESTAMP(3);
