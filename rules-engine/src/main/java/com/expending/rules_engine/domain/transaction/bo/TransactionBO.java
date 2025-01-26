package com.expending.rules_engine.domain.transaction.bo;

import lombok.*;

import java.math.BigDecimal;
import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class TransactionBO {
    private String id;
    private String description;
    private BigDecimal value;
    private Date date;
}
