package com.expending.rules_engine.domain.config.bo;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class Config {
    private Long id;
    private String name;
    private UseInCalculation useInCalculation;
    private Display display;
    private List<Rule> rules;
    private FindPair findPair;
}
