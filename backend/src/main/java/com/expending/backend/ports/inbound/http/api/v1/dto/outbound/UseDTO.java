package com.expending.backend.ports.inbound.http.api.v1.dto.outbound;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class UseDTO {
    private String category;
    private String subcategory;
    private String default_name;
    private BigDecimal reimbursement;
}
