package com.expending.rules_engine.ports.inbound.http.api.v1.dto.outbound;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class FrequencyDTO {
    private Integer value;
    private UnityDTO unity;
    private Integer targetNumber;
}
