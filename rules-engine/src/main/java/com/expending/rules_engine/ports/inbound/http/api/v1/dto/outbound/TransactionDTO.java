package com.expending.rules_engine.ports.inbound.http.api.v1.dto.outbound;

import lombok.*;

import java.math.BigDecimal;
import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class TransactionDTO {
    private String id;
    private String description;
    private BigDecimal value;
    private Date date;
}
