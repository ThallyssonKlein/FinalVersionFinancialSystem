package com.expending.rules_engine.domain.config.bo;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class Use {
    private String category;
    private String subcategory;
    private String defaultName;
    private BigDecimal reimbursement;
}
