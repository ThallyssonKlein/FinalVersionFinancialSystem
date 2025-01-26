package com.expending.rules_engine.ports.inbound.http.api.v1.dto.outbound;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ConfigDTO {
    private Long id;
    private String name;
    private UseInCalculationDTO use_in_calculation;
    private DisplayDTO display;
    private List<RuleDTO> rules;
    private FindPairDTO find_pair;
    private UseDTO use;
}
