package com.expending.backend.ports.inbound.http.api.v1.dto.outbound;

import lombok.*;

import java.math.BigDecimal;
import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class UseInCalculationDTO {
    private TimeDTO time;
    private BigDecimal values_average;
    private BigDecimal monthly_total;
    private Date next_buy_date;
}