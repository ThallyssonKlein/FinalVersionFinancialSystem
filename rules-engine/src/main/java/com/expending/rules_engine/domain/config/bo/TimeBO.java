package com.expending.rules_engine.domain.config.bo;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class TimeBO {
    private BigDecimal value;
    private UnityBO unit;
}
