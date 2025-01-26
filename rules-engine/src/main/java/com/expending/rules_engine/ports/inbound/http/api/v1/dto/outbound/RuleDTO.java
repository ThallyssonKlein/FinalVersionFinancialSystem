package com.expending.rules_engine.ports.inbound.http.api.v1.dto.outbound;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class RuleDTO {
    private String useCalculated;
    private TypeDTO type;
    private BetweenDTO between;
    private String property;
    private Object contains;
    private Object equals;
    private FrequencyDTO frequency;
}
