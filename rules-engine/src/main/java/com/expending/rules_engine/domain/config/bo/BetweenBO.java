package com.expending.rules_engine.domain.config.bo;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class BetweenBO<T extends Comparable<T>> {
    private T value1;
    private T value2;
}
