import { type Client } from "@notionhq/client"
import TransactionBO from "@domain/transaction/bo/TransactionBO";

export default class OutboundTransactionNotionRepositoryPort {
    constructor(private notionClient: Client, private databaseId: string) {}

    async createTransaction(transaction: TransactionBO): Promise<TransactionBO> {
        const response = await this.notionClient.pages.create({
            parent: { database_id: this.databaseId },
            properties: {
              name: {
                title: [
                  { text: { content: transaction.getName() } }
                ]
              },
              value: {
                number: transaction.getValue()
              },
              category: {
                select: {
                  name: transaction.getCategory()
                }
              },
             subcategory: {
                select: {
                name: transaction.getSubcategory()
                }
             },
             date: {
                date: {
                  start: transaction.getDate().toISOString(),
                  end: null
                }
             }
            },
          })
        

        if (!response || !response.id) {
        throw new Error('Transaction not created');
        }

        return new TransactionBO(
            transaction.getName(),
            transaction.getValue(),
            transaction.getDate(),
            transaction.getCategory(),
            transaction.getSubcategory(),
            response.id
        )
    }

    async deleteTransactionById(transactionId: string): Promise<void> {
        await this.notionClient.pages.update({
            page_id: transactionId,
            archived: true
        })
    }
}