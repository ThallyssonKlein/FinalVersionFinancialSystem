package com.expending.backend.ports.inbound.http.api.v1.dto.outbound;

import com.expending.backend.domain.config.bo.UnityBO;
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
