package com.expending.backend.domain.config.bo;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class UseBO {
    private String category;
    private String subcategory;
    private String defaultName;
    private BigDecimal reimbursement;
}
