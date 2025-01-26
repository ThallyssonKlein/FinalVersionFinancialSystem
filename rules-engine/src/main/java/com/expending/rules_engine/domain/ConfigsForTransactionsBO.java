package com.expending.rules_engine.domain;

import com.expending.rules_engine.domain.config.bo.ConfigBO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
public class ConfigsForTransactionsBO {
    Map<String, ConfigBO> configTransactionAssociation;
    List<PairBO> pairBOS;
}
