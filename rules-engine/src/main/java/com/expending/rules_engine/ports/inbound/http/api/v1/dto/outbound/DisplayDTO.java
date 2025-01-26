package com.expending.rules_engine.ports.inbound.http.api.v1.dto.outbound;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class DisplayDTO {
    private String source;
    private Integer amount;
}