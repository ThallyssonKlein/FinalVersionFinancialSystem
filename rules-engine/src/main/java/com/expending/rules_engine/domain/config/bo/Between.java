package com.expending.rules_engine.domain.config;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class Between<T extends Comparable<T>> {
    private T value1;
    private T value2;
}
