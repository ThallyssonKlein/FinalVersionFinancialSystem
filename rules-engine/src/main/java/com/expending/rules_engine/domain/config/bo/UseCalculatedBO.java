package com.expending.rules_engine.domain.config.bo;

import lombok.*;

import java.math.BigDecimal;
import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class UseCalculatedBO {
    private TimeBO timeBO;
    private BigDecimal values_average;
    private BigDecimal monthlyTotal;
    private Date nextBuyDate;
}
