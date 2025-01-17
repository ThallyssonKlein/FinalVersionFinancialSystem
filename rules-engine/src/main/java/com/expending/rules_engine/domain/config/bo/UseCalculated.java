package com.expending.rules_engine.domain.config.bo;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Date;

@Getter
@Setter
public class UseCalculated {
    private Time time;
    private BigDecimal values_average;
    private BigDecimal monthlyTotal;
    private Date nextBuyDate;
}
