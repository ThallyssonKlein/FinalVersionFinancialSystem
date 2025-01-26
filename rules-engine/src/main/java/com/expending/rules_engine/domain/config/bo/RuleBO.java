package com.expending.rules_engine.domain.config.bo;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class RuleBO {
    private String useInCalculation;
    private TypeBO typeBO;
    private BetweenBO betweenBO;
    private String property;
    private Object contains;
    private Object equals;
    private FrequencyBO frequencyBO;
}
