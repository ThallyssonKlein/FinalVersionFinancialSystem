package com.expending.rules_engine.domain.transaction.bo;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Date;

@Getter
@Setter
public class Transaction {
    private String id;
    private String description;
    private BigDecimal value;
    private Date date;
}
