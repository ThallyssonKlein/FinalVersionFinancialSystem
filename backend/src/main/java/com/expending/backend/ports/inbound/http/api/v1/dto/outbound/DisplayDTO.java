package com.expending.backend.ports.inbound.http.api.v1.dto.outbound;

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