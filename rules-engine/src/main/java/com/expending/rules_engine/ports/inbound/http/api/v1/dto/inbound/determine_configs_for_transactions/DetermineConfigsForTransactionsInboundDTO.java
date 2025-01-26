package com.expending.rules_engine.ports.inbound.http.api.v1.dto.inbound.determine_configs_for_transactions;

import com.expending.rules_engine.ports.inbound.http.api.v1.dto.outbound.ConfigDTO;
import com.expending.rules_engine.ports.inbound.http.api.v1.dto.outbound.TransactionDTO;
import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class DetermineConfigsForTransactionsInboundDTO {
    private ConfigDTO default_config;
    private List<ConfigDTO> configs;
    private List<TransactionDTO> transactions;
    private Map<String, List<TransactionDTO>> transactions_grouped_by_date;
}