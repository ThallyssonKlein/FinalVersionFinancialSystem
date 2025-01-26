package com.expending.rules_engine.domain.config.bo;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class ConfigBO {
    private Long id;
    private String name;
    private UseCalculatedBO useCalculatedBO;
    private DisplayBO displayBO;
    private List<RuleBO> ruleBOS;
    private FindPairBO findPairBO;
    private UseBO useBO;
}
