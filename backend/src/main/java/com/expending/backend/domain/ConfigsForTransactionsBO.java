package com.expending.backend.domain;

import com.expending.backend.domain.config.bo.ConfigBO;
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
