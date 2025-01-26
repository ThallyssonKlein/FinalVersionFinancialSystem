package com.expending.rules_engine.ports.inbound.http.api.v1.dto.outbound;

import com.expending.rules_engine.domain.config.bo.Config;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
class PairDTO {
    private String pairName;
    private Long configId;
    private String[] transactionIds;
}

@Getter
@Setter
@AllArgsConstructor
public class ConfigsForTransactionsOutboundDTO {
    Map<String, Config> config_transaction_association;
    List<PairDTO> pairBOS;
}
