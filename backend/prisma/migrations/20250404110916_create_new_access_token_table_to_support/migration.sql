-- CreateTable
CREATE TABLE "support_ticket_access_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_ticket_access_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "support_ticket_access_tokens_token_key" ON "support_ticket_access_tokens"("token");

-- AddForeignKey
ALTER TABLE "support_ticket_access_tokens" ADD CONSTRAINT "support_ticket_access_tokens_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("ticket_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_ticket_access_tokens" ADD CONSTRAINT "support_ticket_access_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
