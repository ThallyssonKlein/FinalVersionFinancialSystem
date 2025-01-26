package com.ports.inbound.http.api.v1.dto.inbound.determine_configs_for_transactions;

import com.expending.rules_engine.domain.transaction.bo.TransactionBO;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TransactionsGroupedByDateDTO {
    private List<String> dates;
    private String date;
    private List<TransactionBO> transactionBOS;
}
