package com.expending.rules_engine.ports.inbound.http.api.v1.dto.outbound;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class ConfigsForTransactionsOutboundDTO {
    Map<String, ConfigDTO> config_transaction_association;
    List<PairDTO> pairs;
}
