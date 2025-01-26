package com.expending.rules_engine.ports.inbound.http.api.v1.dto.outbound;

import com.expending.rules_engine.domain.config.bo.UnityBO;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class TimeDTO {
    private BigDecimal value;
    private UnityBO unit;
}
