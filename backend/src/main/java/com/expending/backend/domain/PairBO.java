package com.expending.backend.domain;

import com.expending.backend.domain.config.bo.ConfigBO;
import com.expending.backend.domain.transaction.bo.TransactionBO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class PairBO {
    private String pairName;
    private ConfigBO configBO;
    private List<TransactionBO> transactionBOS;
}
