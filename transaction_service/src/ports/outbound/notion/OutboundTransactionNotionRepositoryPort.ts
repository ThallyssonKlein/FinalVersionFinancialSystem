import { type Client } from "@notionhq/client"
import TransactionBO from "@domain/transaction/bo/TransactionBO";
import Loggable from "@shared/Loggable";
import IToken from "../database/token/IToken";

export default class OutboundTransactionNotionRepositoryPort extends Loggable {
    constructor(private notionClient: Client) {
      super('OutboundTransactionNotionRepositoryPort');
    }

    async createTransaction(userToken: IToken, transaction: TransactionBO, traceId: string): Promise<TransactionBO> {
        this.log.info(`Creating transaction ${transaction.getName()}`, traceId);
        const response = await this.notionClient.pages.create({
            parent: { database_id: userToken.notionDatabaseId },
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
        this.log.info(`Transaction created with id ${response.id}`, traceId);

        return new TransactionBO(
            transaction.getName(),
            transaction.getValue(),
            transaction.getDate(),
            transaction.getCategory(),
            transaction.getSubcategory(),
            response.id
        )
    }

    async deleteTransactionById(notionClient: Client, transactionId: string, traceId: string): Promise<void> {
        this.log.info(`Deleting transaction with id ${transactionId}`, traceId);
        await notionClient.pages.update({
            page_id: transactionId,
            archived: true
        })
        this.log.info(`Transaction deleted with id ${transactionId}`, traceId);
    }
}