package com.ports.inbound.http.api.v1.dto.inbound.determine_configs_for_transactions;

import com.expending.rules_engine.domain.TransactionsGroupedByDateBO;
import com.expending.rules_engine.domain.config.bo.Config;
import com.expending.rules_engine.domain.transaction.bo.Transaction;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class DetermineConfigsForTransactionsInboundDTO {
    private Config default_config;
    private List<Config> configs;
    private List<Transaction> transactions;
    private TransactionsGroupedByDateBO transactionsGroupedByDateBO;
}
