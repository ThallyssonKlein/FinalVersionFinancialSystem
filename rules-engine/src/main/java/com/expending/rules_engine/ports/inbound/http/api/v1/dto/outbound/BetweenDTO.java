package com.expending.rules_engine.ports.inbound.http.api.v1.dto.outbound;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class BetweenDTO<T extends Comparable<T>> {
    private T value1;
    private T value2;
}