package com.expending.rules_engine.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class PairBO {
    private String pairName;
    private Long configId;
    private String[] transactionIds;
}
